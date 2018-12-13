document.addEventListener('DOMContentLoaded', function () {
	init()

	$('#pay-rent').click(handlePayRent)
	$('#view-data').click(handleViewPayRent)

	nameUrlParameter(handleGetStatus)
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

function transferAndCallData () {
	let signature = web3.sha3('transferAndCall(address,uint,bytes)')
	let name = $('#name').val()

	let data = signature.slice(0, 10) +
		'000000000000000000000000' + config.contracts.registrar.slice(2, 42) +
		'0000000000000000000000000000000000000000000000000DE0B6B3A7640000' +
		'0000000000000000000000000000000000000000000000000000000000000006' + // bytes offset
		'0000000000000000000000000000000000000000000000000000000000000024' + // bytes length
		'e1ac9915' + web3.sha3(name).slice(2, 66) + '00000000000000000000000000000000000000000000000000000000' // 36 bytes padded 32

		let tx = {
			to: config.contracts.rif,
			value: '0x00',
			data: data
		}

		return tx
}

function handleViewPayRent () {
	let tx = transferAndCallData()

	$('#tx-data-error').hide()

	let copyButton = (content) => '<i id="copy" class="far fa-copy" onclick="copyData(\'' + content + '\')"></i> '

	$('#tx-data-to').html('to: ' + copyButton(tx.to) + tx.to)
	$('#tx-data-value').html('value: ' + copyButton(tx.value) + tx.value)
	$('#tx-data-data').html('data: ' + copyButton(tx.data) + tx.data)

	$('#tx-data').show()
}
