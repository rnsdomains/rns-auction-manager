document.addEventListener('DOMContentLoaded', function () {
	init()

  $('#pay-rent').click(handlePayRent)

	nameUrlParameter(handleGetStatus)

	$('#modal-mycrypto-ownership').on('shown.bs.modal', () => {
		let name = $('#name').val()
		$('#modal-mycrypto-ownership .modal-domain').html(name + '.' + config.tld)

		let hash = web3.sha3(name)
		$('#modal-mycrypto-ownership .modal-hash').html(hash)
		handleCopy(hash, '#modal-mycrypto-ownership .modal-copy-hash', 'modal-mycrypto-ownership')
	})

	$('#modal-mycrypto-rent').on('shown.bs.modal', () => {
		let name = $('#name').val()
		$('#modal-mycrypto-rent #modal-domain').html(name + '.' + config.tld)

		let to = config.contracts.registrar
		$('#modal-mycrypto-rent #modal-to').html(to)
		handleCopy(to, '#modal-mycrypto-rent #copy-to', 'modal-mycrypto-rent')

		let tokens = 1e18
		$('#modal-mycrypto-rent #modal-value').html(tokens)
		handleCopy(tokens, '#modal-mycrypto-rent #copy-value', 'modal-mycrypto-rent')

		let hash = web3.sha3(name)
		$('#modal-mycrypto-rent #modal-data').html('0xe1ac9915<br />' + hash.slice(2, 66) + '<br />00000000000000000000000000000000000000000000000000000000')
		handleCopy('0xe1ac9915' + hash.slice(2, 66) + '00000000000000000000000000000000000000000000000000000000', '#modal-mycrypto-rent #copy-data', 'modal-mycrypto-rent')
	})
})

/**
 * Gets deed data from backend
 */
function handleGetStatus () {
	let name = $("#name").val()

	pushState(name)

	$('#owner').html('')
	$('#token-quantity').html('')
	$('#expiration').html('')
	$('#stage').html('')

	$.ajax({
		type: "GET",
		url: window.location.origin + '/deeddata',
		data: { 'name': name },
		beforeSend: () =>  $('#addr-action-loading').show(),
		complete: () => $('#addr-action-loading').hide(),
		success: (response) => displayDeed(response),
		error: (xhr, ajaxOptions, thrownError) => $('#server-error').show()
	})

	return false
}

/**
 * parses and displays deed data
 * @param {response} response /deeddata response status
 */
function displayDeed (response) {
    let deed = JSON.parse(response)

	if (deed === '0x00') {
		let name = $('#name').val()
        $('#no-owner').html('"' + name + '.' + config.tld + '" domain has nor owner neither auction winner.<br><br>' +
            '<a class="btn btn-default btn-sm" href="/domain-status?name=' + $('#name').val() + '">Check the domain status</a>')
			.show()
		return
	}

    if (!deed.expired && deed.canPayRent) $('#pay-rent-tab').show()
    else $('#pay-rent-tab').hide()

    let expiration = '<span>' + new Date(deed.expirationDate * 1000).toLocaleString() + '</span>'
	let stage = (!deed.expired
			? '<span> </span><span class="label label-success">Active</span>' +
				(deed.canPayRent ? '<span> </span><small>Within rent payment period</small>' : '')
			: '<span> </span><span class="label label-danger">Expired</span>')

	if (deed.canPayRent) hasMetaMask()

	$('#owner').html('<a target="_blank" href="' + config.explorer.url + config.explorer.address + deed.owner + '">' + deed.owner + '</a>')
	$('#token-quantity').html(toRIF(deed.tokenQuantity))
	$('#expiration').html(expiration)
	$('#stage').html(stage)
	$('#result-container').show()
}

/**
 * returns parsed token quantity
 * @param {int} value cuantity to convert
 */
function toRIF (value) {
	return (value / 10 ** 18) + ' RIF'
}

/**
 * Pay the rent with MetaMask
 */
function handlePayRent () {
	var RIF = getRIF()
	executeTx('#pay-rent-loading', '#pay-rent')

	let name = $('#name').val()

	let sha3 = web3.sha3(name)

	RIF.transferAndCall(config.contracts.registrar, 1e18, '0xe1ac9915' + sha3.slice(2), (err, res) => {
		$('#pay-rent-loading').hide()

		if (err) {
			$('#pay-rent').prop('disabled', false)
			$('#error-message').show()
			$('#error-detail').html(err)
		} else {
			var c = $('#pay-rent-tab .alert-success')
			var l = $('a.explorer-link', c)
			c.show()
			l.html(res)
			l.attr('href', config.explorer.url + config.explorer.tx + res)
		}
	})
}
