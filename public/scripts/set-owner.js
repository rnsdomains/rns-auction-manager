document.addEventListener('DOMContentLoaded', function () {
	init()

	$('#name').keyup(handleNameKeyup)
	$('#address').keyup(handleAddressKeyup)
	$('#owner').click(handleGetRecord)
    $('#set-owner').click(handleSetOwner)

	hasMetaMask()

	nameUrlParameter(handleGetRecord)
})  

/**
 * Get a domain's owner with MetaMask
 */
function handleGetRecord () {
	let RNS = getRNS()
	let name = $('#name').val()
	
	let hash = namehash(name + '.' + config.tld)

	history.pushState(name, document.title, "?name=" + name)

	RNS.owner(hash, (err, res) => {
		$('#display-address').html(toChecksumAddress(res, config.chainId))
		$('#addr-response').show()

		if (notNullAddress(res)) {
			$('.setter').attr('disabled', false)
			$('#owner-response').show()
		} else {
			$('.setter').attr('disabled', true)
			$('#no-owner').show()
		}
	})
}

/**
 * Set a domain's owner with MetaMask
 */
function handleSetOwner () {
	let RNS = getRNS()
	let address = $('#address').val()
	let name = $('#name').val()

	executeTx('#addr-action-loading', '#set-addr')

	let hash = namehash(name + '.' + config.tld)

    $('.disable-on-addr-invalid').attr('disabled', true)

	RNS.setOwner(hash, address, (err, res) => finalizeTx(
		'#addr-action-loading', '#set-addr', err, res))
}
