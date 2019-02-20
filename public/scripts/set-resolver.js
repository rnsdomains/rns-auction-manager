document.addEventListener('DOMContentLoaded', function () {
	init()

	$('#name').keyup(handleNameKeyup)
	$('#address').keyup(handleAddressKeyup)

	hasMetaMask()

	nameUrlParameter(handleGetRecord)

	$('#modal-mycrypto-resolver').on('shown.bs.modal', () => {
		let name = $('#name').val() + '.' + config.tld
		let hash = namehash(name)

		$('#modal-mycrypto-resolver .modal-domain').html(name)
		$('#modal-mycrypto-resolver .modal-hash').html(hash)
		handleCopy(hash, '#modal-mycrypto-resolver .modal-copy-hash', 'modal-mycrypto-resolver')
	})

	$('#modal-mycrypto-setresolver').on('shown.bs.modal', () => {
		let name = $('#name').val() + '.' + config.tld
		let hash = namehash(name)
		let address = $('#address').val()

		$('#modal-mycrypto-setresolver .modal-domain').html(name)
		$('#modal-mycrypto-setresolver .modal-hash').html(hash)
		handleCopy(hash, '#modal-mycrypto-setresolver .modal-copy-hash', 'modal-mycrypto-setresolver')
		$('#modal-addr').html(address)
		handleCopy(address, '#modal-mycrypto-setresolver #modal-copy-addr', 'modal-mycrypto-setresolver')
	})
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
		'#addr-action-loading', '#set-resolver', err, res))

	return false
}
