const path = require('path')
const express = require('express')
const hbs = require('hbs')
const fs = require('fs');
const geocode = require('./utils/geocode')
const forecast = require('./utils/forecast')

const app = express()
const name = 'Ricardo B.'

// Define paths for Express config
const publicDir = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine e views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDir))

app.get('', (req, res) => {
	res.render('index', {
		title: 'Weather',
		name
	})
})

app.get('/about', (req, res) => {
	res.render('about', {
		title: 'About Me',
		name
	})
})

app.get('/help', (req, res) => {
	res.render('help', {
		title: 'Help',
		name,
		helpText: 'hit /api for example JSON. /weather?address=someAddress to gather forecast for specific location.'
	})
})

app.get('/weather', (req, res) => {
	if (!req.query.address){
		return res.send({
			error: 'You must provide an address.'
		})
	}

	geocode(req.query.address, (error, {latitude, longitude, location} = {}) => {
		if (error){
			return res.send({ error })
		}

		forecast(latitude, longitude, (error, forecastData) => {
			if (error) {
				return res.send ({ error })
			}

			res.send({
				forecast: forecastData,
				location,
				address: req.query.address
			})
		})
	})
})

app.get('/api', (req, res) => {
	const data = fs.readFileSync(__dirname + '/data.json', 'utf8')
	return res.send(JSON.parse(data))
})

app.get('/products', (req, res) => {
	if (!req.query.search) {
		return res.send({
			error: 'You must provide a search term.'
		})
	}
	console.log(req.query)
	res.send({
		products: []
	})
})

app.get('/help/*', (req, res) => {
	res.render('404', {
		title: '404',
		name,
		errorMessage: 'Help article not found.'
	})
})

app.get('*', (req, res) => {
	res.render('404', {
		title: '404',
		name,
		errorMessage: 'Page not found.'
	})
})

app.listen(3000, () => {
	console.log('Server is up on port 3000.')
})