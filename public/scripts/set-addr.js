document.addEventListener('DOMContentLoaded', function () {
	init()

	$('#name').keyup(handleNameKeyup)
	$('#address').keyup(handleAddressKeyup)

	hasMetaMask()

	nameUrlParameter(handleGetRecord)

	$('#modal-mycrypto-addr').on('shown.bs.modal', () => {
		let name = $('#name').val()
		let hash = web3.sha3(name)

		$('#modal-mycrypto-addr .modal-domain').html(name + '.' + config.tld)
		$('#modal-mycrypto-addr .modal-hash').html(hash)
		handleCopy(hash, '#modal-mycrypto-addr .modal-copy-hash', 'modal-mycrypto-addr')
	})

	$('#modal-mycrypto-setaddr').on('shown.bs.modal', () => {
		let name = $('#name').val()
		let hash = web3.sha3(name)
		let address = $('#address').val()

		$('#modal-mycrypto-setaddr .modal-domain').html(name + '.' + config.tld)
		$('#modal-mycrypto-setaddr .modal-hash').html(hash)
		handleCopy(hash, '#modal-mycrypto-setaddr .modal-copy-hash', 'modal-mycrypto-setaddr')
		$('#modal-addr').html(address)
		handleCopy(address, '#modal-mycrypto-setaddr #modal-copy-addr', 'modal-mycrypto-setaddr')
	})
})

/**
 * Get a domain resolution with MetaMask
 */
function handleGetRecord () {
	let RNS = getRNS()
	let name = $('#name').val()

	pushState(name)

	let hash = namehash(name + '.' + config.tld)

	RNS.resolver(hash, (err, res) => {
		if (notNullAddress(res)) {
			let resolver = getResolver(res)

			resolver.addr(hash, (err2, res2) => {
				$('#display-address').html(toChecksumAddress(res2, config.chainId))
				$('#addr-response').show()
			})
		}
		else {
			$('.setter').attr('disabled', true)
			$('#no-resolution').show()
		}
	})

	return false
}

/**
 * Set a domain resolution with MetaMask
 */
function handleSetAddr () {
	var RNS = getRNS()

	let name = $('#name').val()

	executeTx('#address', '#set-owner')

	let hash = namehash(name + '.' + config.tld)

	$('#addr-action-loading').show()
  $('.disable-on-addr-invalid').attr('disabled', true)

	RNS.resolver(hash, (err, res) => {
		if (!err) {
			let resolver = getResolver(res)
			let address = $('#address').val()

			resolver.setAddr(hash, address, (err2, res2) => {
				finalizeTx('#addr-action-loading', '#set-owner', err2, res2)
				if (!err2) $('#check-resolution').show()
			})
		}
	})

	return false
}
