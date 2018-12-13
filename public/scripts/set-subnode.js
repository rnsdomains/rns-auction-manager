document.addEventListener('DOMContentLoaded', function () {
	init()

    $('#set-subnode').click(handleSetSubnode)
	$('#view-data').click(() => handleViewData(txDataSubnode))

	hasMetaMask()

	nameUrlParameter()

	handleValidations()
})

function handleValidations () {
	let nameValid = false
	let labelValid = false
	let addressValid = false

	$('#name').keyup(() => {
		nameValid = isValidName($('#name').val())
		if (!nameValid) $('#name-group').addClass('on-error')
		else $('#name-group').removeClass('on-error')
		$('#subdomain-suffix').html('.' + $('#name').val() + '.' + config.tld)
		displayValidations()
	})

	$('#label').keyup(() => {
		labelValid = isValidLabel($('#label').val())
        if (labelValid)  $('#label-group').removeClass('on-error')
        else $('#label-group').addClass('on-error')
		displayValidations()
    })

	$('#address').keyup(() => {
		let address = isValidAddress($('#address').val())
		addressValid = address !== ''

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
	var RNS = getRNS()

	let node =  $('#name').val() + '.' + config.tld
	let label = $('#label').val()
	let address = $('#address').val()

	executeTx('#addr-action-loading', '#set-subnode')

	var hash = namehash(node)
	var labelHash = web3.sha3(label)

	RNS.setSubnodeOwner(hash, labelHash, address, (err, res) => {
		finalizeTx('#addr-action-loading', '#set-subnode', err, res)
	})
}

function txDataSubnode () {
	let signature = web3.sha3('setSubnodeOwner(bytes32,bytes32,address)')
	var hash = namehash($('#name').val() + '.' + config.tld)
	var labelHash = web3.sha3($('#label').val())
	let address = $('#address').val() || '0x0000000000000000000000000000000000000000'

	let data = signature.slice(0, 10) +
		hash.slice(2, 64) +
		labelHash.slice(2, 64) +
		'000000000000000000000000' + address.slice(2, 40)

	let tx = {
		to: config.contracts.rns,
		value: '0x00',
		data: web3.toHex(data)
	}

	return tx
}
