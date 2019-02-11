var express = require('express')
var engine = require('ejs-locals')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

var fs = require('fs')
var namehash = require('eth-ens-namehash').hash
var Web3 = require('web3')

var routes = require('./routes/router')
var favicon = require('serve-favicon')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', engine)
app.set('view engine', 'ejs')

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', routes)

// get configuration
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))

app.listen(config.port);

// Initialize web3
var web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(config.node))

// Registrar entry
var registrarAbi = JSON.parse(fs.readFileSync('./abi/registrar.json', 'utf8'))
var registrarInstance = web3.eth.contract(registrarAbi)
var registrar = registrarInstance.at(config.contracts.registrar)

app.get('/status', function (req, res) {
    let hash = '0x' + web3.sha3(req.query.name)

    let status = registrar.entries(hash)

    return res.status(200).send(JSON.stringify(status))
})

// Deed data
var DeedAbi = JSON.parse(fs.readFileSync('./abi/deed.json', 'utf8'))
var deedInstance = web3.eth.contract(DeedAbi)

app.get('/deeddata', function (req, res) {
    let hash = '0x' + web3.sha3(req.query.name)
    let entry = registrar.entries(hash)

    if(entry[1] === "0x0000000000000000000000000000000000000000")
        return res.status(200).send(JSON.stringify('0x00'))

    let deed = deedInstance.at(entry[1])

    let data = {
        owner: deed.owner(),
        tokenQuantity: deed.tokenQuantity(),
        expirationDate: deed.expirationDate(),
        canPayRent: deed.canPayRent(),
        expired: deed.expired()
    }

    return res.status(200).send(JSON.stringify(data))
})

// Resolver
var registryAbi = JSON.parse(fs.readFileSync('./abi/registry.json', 'utf8'))
var registryInstance = web3.eth.contract(registryAbi)
var registry = registryInstance.at(config.contracts.rns)

var resolverAbi =  JSON.parse(fs.readFileSync('./abi/resolver.json', 'utf8'))
var resolverInstance = web3.eth.contract(resolverAbi)

app.get('/resolvename', function(req, res) {
    let hash = namehash(req.query.name + '.' + config.tld)

    let resolverAddress = registry.resolver(hash)

    if(resolverAddress === '' || resolverAddress === '0x00' || resolverAddress === '0x0000000000000000000000000000000000000000')
        return res.status(200).send(JSON.stringify('0x00'))
    let resolver = resolverInstance.at(resolverAddress)

    if (!resolver.has(hash, 'addr'))
        return res.status(200).send(JSON.stringify('0x00'))

    let result = resolver.addr(hash)

    return res.status(200).send(JSON.stringify(result))
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: err
        })
    })
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {}
    })
})

module.exports = app
