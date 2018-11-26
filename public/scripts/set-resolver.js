document.addEventListener('DOMContentLoaded', function () {
	init()

	$('#name').keyup(handleNameKeyup)
	$('#address').keyup(handleAddressKeyup)

	hasMetaMask()

	nameUrlParameter(handleGetRecord)
})

/**
 * Get a domain resolver address with MetaMask
 */
function handleGetRecord () {
	let RNS = getRNS()
	let name = $('#name').val()

	let hash = namehash(name + '.' + config.tld)

	pushState(name)

	RNS.resolver(hash, (err, res) => {
		$('#display-address').html(res)

		if (notNullAddress(res)) {
			$('.setter').attr('disabled', false)
			$('#resolver-response').show()
		} else {
			$('.setter').attr('disabled', true)
			$('#no-owner').show()
		}
	})

	return false
}

/**
 * Set a domain resolver address with MetaMask
 */
function handleSetResolver () {
	let RNS = getRNS()
	let address = $('#address').val()
	let name = $('#name').val()

	executeTx('#addr-action-loading', '#set-resolver')

	let hash = namehash(name + '.' + config.tld)

    $('.disable-on-addr-invalid').attr('disabled', true)

	RNS.setResolver(hash, address, (err, res) => finalizeTx(
		'#addr-action-loading', '#set-owner', err, res))

	return false
}
