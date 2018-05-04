# Petition for Geoprivacy Protection

Location of our devices is being tracked and we are not in control of it.
Let's call for more transparency in geoprivacy!!!
To learn more or check the [GEOPRIVACY MANIFESTO](http://grantmckenzie.com/academics/GeoprivacyManifesto2017.pdf).

## Technology

Petition platform built with `Handlebars` & `jQuery` at the front, `Node.js` & `Express.js` for the back.

For getting and displaying user location - `ipinfo.io`(getting location from IP with API call) and `Leaflet.js API` (mapping) are used.

Data stored in `Postgres` DB & `Redis` a nosql DB is used for caching a list of signers.

## App Pages

* Registration/login (_only if not logged in_).
* Invitation to sign the petition for 'Geoprivacy Protection'. Signature is being taken from `canvas` element.
* View/edit signature.
* View/edit personal information.
* View the last 30 recent signees with if given age and city. City is linked, so it is possible to navigate to signees only from that specific city.

## To view:

_should have node installed_
To install dependencies: `npm install`. To run page on localhost:8080 launch server from command line with `node index.js`.

Available on heroku: https://geoprivacy.herokuapp.com/