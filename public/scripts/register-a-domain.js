document.addEventListener('DOMContentLoaded', () => {
	init()

    $('#name').keyup(handleLabelKeyup)

	nameUrlParameter(handleGetStatus)

	hasMetaMask()

	$('#start-auction-button').click(handleStartAuction)
	$('#finalize-auction').click(handleFinalize)
})

/**
 * gets status and display stage section
 */
function handleGetStatus () {
	let name = $('#name').val()

	pushState(name)

	$('#action-alert').html('')
	$.ajax({
		type: 'GET',
		url: window.location.origin + '/status',
		data: { 'name': name },
		beforeSend: () => $('#name-action-loading').show(),
		complete: () => $('#name-action-loading').hide(),
		success: (response) => displayStatus(response),
		error: () => $('#server-error').show()
	})

	return false
}

/**
 * Start an auction with MetaMask
 */
function handleStartAuction () {
	let registrar = getRegistrar()

	let name = $('#name').val()

	executeTx('#loading-start-auction', '#start-auction-button')

	let hash = web3.sha3(name)

	registrar.startAuction(hash, (err, res) => {
		$('#loading-start-auction').hide()

		if (err) {
			$('#error-detail').html(err)
			$('#error-response').show()
		} else {
			let c = $('#start-auction .alert-success')
			let l = $('a.explorer-link', c)
			c.show()
			l.html(res)
			l.attr('href', config.explorer.url + config.explorer.tx + res)
		}
	})
}

/**
 * Bid with MetaMask
 */
function handleBid () {
	let registrar = getRegistrar()
	let RIF = getRIF()

	let name = $('#name').val()
	$('#error-response').hide()
	executeTx('#loading-make-bid', '#make-bid')

	let hash = web3.sha3(name)
	let address = web3.eth.defaultAccount
	let tokens = $('#bid-tokens').val() * (10 ** 18)
	let salt = $('#bid-salt').val()

	registrar.shaBid(hash, address, tokens, salt, (shaerr, shares) => {
		handleMetamask(shaerr, shares, '#action-alert')
		if (!shaerr) {
			RIF.transferAndCall(registrar.address, tokens, '0x1413151f' + shares.slice(2), (err, res) => {
				$('#loading-make-bid').hide()

				if (err) {
					$('#error-response').show()
					$('#error-detail').html(err)
				} else {
					let c = $('#bid .alert-success')
					let l = $('a.explorer-link', c)
					let d = $('button.download', c)
					c.show()
					l.html(res)
					l.attr('href', config.explorer.url + config.explorer.tx + res)

					d.attr('data-name', name)
					d.attr('data-sha3', hash)
					d.attr('data-address', address)
					d.attr('data-tokens', tokens)
					d.attr('data-salt', salt)
				}
			})
		}
	})

	return false
}

/**
 * Unseal bid with MetaMask
 */
function handleReveal () {
	let registrar = getRegistrar()

	let name = $('#name').val()
	executeTx('#loading-reveal-bid', '#reveal-bid')

	let hash = web3.sha3(name)
	let tokens = $('#reveal-tokens').val() * (10 ** 18)
	let salt = $('#reveal-salt').val()

	registrar.unsealBid(hash, tokens, salt, (err, res) =>  {
		$('#loading-reveal-bid').hide()

		if(err) {
			$('#error-response').show()
			$('#error-detail').html(err)
		} else {
			let c = $('#reveal .alert-success')
			let l = $('a.explorer-link', c)
			c.show()
			l.html(res)
			l.attr('href', config.explorer.url + config.explorer.tx + res)
		}
	})

	return false
}

/**
 * Finalize auction with MetaMask
 */
function handleFinalize () {
	let registrar = getRegistrar()

	let name = $('#name').val()
	executeTx('#loading-finalize-auction', '#finalize-auction')

	let hash = web3.sha3(name)

	registrar.finalizeAuction(hash, (err, res) => {
		$('#loading-finalize-auction').hide()

		if(err) {
			$('#finalize-auction').prop('disabled', false)
			$('#error-response').show()
			$('#error-detail').html(err)
		} else {
			let c = $('#finalize .alert-success')
			let l = $('a.explorer-link', c)
    		$('#set-resolver').show()
			// to check wether the user has finalized or not, check the deed value.
			c.show()
			l.html(res)
			l.attr('href', config.explorer.url + config.explorer.tx + res)
		}
	})
}

/**
 * parses and displays entry state
 * @param {string} state entries query result
 */
function displayStatus (response) {
	let status = JSON.parse(response)
	var state = status[0]
	let name = $('#name').val()
	var dsteps = $('#domain-steps li')
	$(dsteps).removeClass('active')
	$('section.step').hide()

	switch (state) {
		case '0':
			var c = $('#start-auction')
			$(dsteps.get(0)).addClass('active')
			$('.alert-success', c).hide()
			c.show()
			$('#start-auction-button').prop('disabled', false)

			break
		case '1':
			var c = $('#bid')
			var ca = $('.addeventatc', c)

			let start = status[2] * 1000 - config.periods.auction * 1000 - config.periods.reveal * 1000
			let end = status[2] * 1000 - config.periods.reveal * 1000
			var startdate = new Date(start)
			var enddate = new Date(end)
			var link = location.protocol + '//' + location.host + location.pathname + '?name=' + name;

			$('.auction-date', c).html(startdate.toLocaleString())
			$('.auction-end-date', c).html(enddate.toLocaleString())

			$('.start', ca).html(startdate.toLocaleString())
			$('.end', ca).html(enddate.toLocaleString())
			$('.timezone', ca).html(startdate.toString().slice(startdate.toString().split(' ', 5).join(' ').length + 1))

			$('.title', ca).html('RNS Domain Auction for: ' + name + '.' + config.tld)
			$('.description', ca).html('The RNS Domain Auction for "' + name + '." ' + config.tld + ' is open during this calendar event. Ensure you reveal your bid after this period using the link: ' + link)
			$('.location', ca).html(link)

			$(dsteps.get(1)).addClass('active')
			c.show()

			break
		case '4':
			$(dsteps.get(2)).addClass('active')
			$('#reveal').show()

			break
		case '2':
			$(dsteps.get(3)).addClass('active')
			$('#finalize').show()
			break
	}

	$('.domain-registration-stage-panel').show()
}

/**
 * Downloads bid data in browser
 * @param {button} e button element with download data
 */
function downloadBid (e) {
	let n = $(e).attr('data-name')
	let sha3 = $(e).attr('data-sha3')
	let address = $(e).attr('data-address')
	let tokens = $(e).attr('data-tokens')
	let salt = $(e).attr('data-salt')

	let text = 'Keep this information for your RNS Name registration process. \r\n' +
		'Name: ' + n + '.rsk\r\n' +
		'Bided amount: ' + tokens + ' RIFi\r\n' +
		'Salt: ' + salt + '\r\n' +
	  	'Address: ' + address + '\r\n' +
		'sha3("' + n + '"): ' + sha3

	let element = document.createElement('a')
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
	element.setAttribute('download', 'RNS-bid-' + n + '.txt')
	element.style.display = 'none'

	document.body.appendChild(element)
	element.click()

	document.body.removeChild(element)
}

/**
 * returns a random 256 bit hexa
 */
function random() {
	var randomBytes = window.crypto.getRandomValues(new Uint8Array(32))
	return '0x' + Array.from(randomBytes).map((byte) => byte.toString(16)).join('')
}
