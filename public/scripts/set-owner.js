document.addEventListener('DOMContentLoaded', function () {
	init()

	$('#name').keyup(handleNameKeyup)
	$('#address').keyup(handleAddressKeyup)

	hasMetaMask()

	nameUrlParameter(handleGetRecord)

	$('#modal-mycrypto-owner').on('shown.bs.modal', () => {
		let name = $('#name').val() + '.' + config.tld
		let hash = namehash(name)

		$('#modal-mycrypto-owner .modal-domain').html(name)
		$('#modal-mycrypto-owner .modal-hash').html(hash)
		handleCopy(hash, '#modal-mycrypto-owner .modal-copy-hash', 'modal-mycrypto-owner')
	})

	$('#modal-mycrypto-setowner').on('shown.bs.modal', () => {
		let name = $('#name').val() + '.' + config.tld
		let hash = namehash(name)
		let address = $('#address').val()

		$('#modal-mycrypto-setowner .modal-domain').html(name)
		$('#modal-mycrypto-setowner .modal-hash').html(hash)
		handleCopy(hash, '#modal-mycrypto-setowner .modal-copy-hash', 'modal-mycrypto-setowner')
		$('#modal-addr').html(address)
		handleCopy(address, '#modal-mycrypto-setowner #modal-copy-addr', 'modal-mycrypto-setowner')
	})
})

/**
 * Get a domain's owner with MetaMask
 */
function handleGetRecord () {
	let RNS = getRNS()
	let name = $('#name').val()

	let hash = namehash(name + '.' + config.tld)

	pushState(name)

	RNS.owner(hash, (err, res) => {
		$('#display-address').html(toChecksumAddress(res, config.chainid))

		if (notNullAddress(res)) {
			$('.setter').attr('disabled', false)
			$('#owner-response').show()
		} else {
			$('.setter').attr('disabled', true)
			$('#no-owner').show()
		}
	})

	return false
}

/**
 * Set a domain's owner with MetaMask
 */
function handleSetOwner () {
	let RNS = getRNS()
	let address = $('#address').val()
	let name = $('#name').val()

	executeTx('#addr-action-loading', '#set-owner')

	let hash = namehash(name + '.' + config.tld)

    $('.disable-on-addr-invalid').attr('disabled', true)

	window.ethereum.enable().then(() => {
		RNS.setOwner(hash, address, (err, res) => finalizeTx(
			'#addr-action-loading', '#set-owner', err, res))
		})

	return false
}
