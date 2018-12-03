var express = require('express')
var router = express.Router()
var fs = require('fs')

var paths = [
	'resolve',
	'domain-status',
	'register-a-domain',
	'set-addr',
	'set-owner',
	'set-subnode',
	'set-resolver',
	'manage',
	'registry',
	'set-resolver',
	'deed',
	'setup'
]

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))

var pageData = {
	title: 'Express',
	googleAnalytics: config.googleAnalytics,
	tld: config.tld,
	rif: config.contracts.rif,
	rns: config.contracts.rns,
	registrar: config.contracts.registrar,
	explorerUrl: config.explorer.url,
	explorerTx: config.explorer.tx,
	explorerAddress: config.explorer.address,
	auctionLength: config.periods.auction,
	revealLength: config.periods.reveal,
	chainId: config.chainId
}

router.get('/', function(req, res) {
	res.render('index', pageData)
})

paths.forEach(e => {
	router.get('/' + e, (req, res) => res.render(e, pageData))
})

module.exports = router
