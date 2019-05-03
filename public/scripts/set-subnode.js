document.addEventListener('DOMContentLoaded', function () {
	init()

    $('#set-subnode').click(handleSetSubnode)

	hasMetaMask()

	nameUrlParameter()

	handleValidations()

	$('#modal-mycrypto-subnode').on('shown.bs.modal', () => {
		let name = $('#name').val() + '.' + config.tld
		let hash = namehash(name)
		let label = $('#label').val()
		let labelHash = web3.sha3(label)
		let address = $('#address').val()

		$('#modal-domain').html(label + '.' + name)
		$('#modal-node').html(hash)
		handleCopy(hash, '#modal-copy-node', 'modal-mycrypto-subnode')
		$('#modal-label').html(labelHash)
		handleCopy(labelHash, '#modal-copy-label', 'modal-mycrypto-subnode')
		$('#modal-addr').html(address)
		handleCopy(address, '#modal-copy-addr', 'modal-mycrypto-subnode')
	})
})

function handleValidations () {
	let nameValid = false
	let labelValid = false
	let addressValid = false

	$('#name').keyup(() => {
		error = isValidName($('#name').val())
		nameValid = !error
		if (error) $('#name-group').addClass('on-error')
		else $('#name-group').removeClass('on-error')
		$('#name-error').html(error)
		$('#subdomain-suffix').html('.' + $('#name').val() + '.' + config.tld)
		displayValidations()
	})

	$('#label').keyup(() => {
		error = isValidLabel($('#label').val())
		labelValid = !error
		if (!error) $('#label-group').removeClass('on-error')
		else $('#label-group').addClass('on-error')
		$('#subdomain-error').html(error)
		displayValidations()
	})

	$('#address').keyup(() => {
		let error = isValidAddress($('#address').val())
		addressValid = !error

		$('#address-error').html(error)

		if (addressValid) $('#address-group').removeClass('on-error')
		else $('#address-group').addClass('on-error')
		displayValidations()
	})

	function displayValidations () {
		let valid =  nameValid && labelValid
		$('#address').attr('disabled', !valid)

		let ready = valid && addressValid
		$('#set-subnode').attr('disabled', !ready)
	}
}

function handleSetSubnode () {
	let RNS = getRNS()

	let node =  $('#name').val() + '.' + config.tld
	let label = $('#label').val()
	let address = $('#address').val()

	executeTx('#addr-action-loading', '#set-subnode')

	let hash = namehash(node)
	let labelHash = web3.sha3(label)

	window.ethereum.enable().then(() => {
		RNS.setSubnodeOwner(hash, labelHash, address, (err, res) => {
			finalizeTx('#addr-action-loading', '#set-subnode', err, res)
		})
	})
}
