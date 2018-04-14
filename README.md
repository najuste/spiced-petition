# Petition for Geoprivacy Protection

Location of our devices is being tracked and we are not in control of it.
Let's call for more transparency in geoprivacy!!!
To learn more or check the [GEOPRIVACY MANIFESTO](http://grantmckenzie.com/academics/GeoprivacyManifesto2017.pdf).

## Technology
Petition platform built with `jQuery`, `Node.js` & `Express.js`. 
For getting and displaying user location - `ipinfo API`(extracting location) and `Leaflet.js API` (mapping) are used. 
Data stored in `Postres` DB & `Redis` nosql DB for caching.

## App Structure
Registation/login pages if not logged in.
Invitation to sign the petition for 'Geoprivacy Protection' page. Signature is being taken on `canvas` element. 
Pages to review/edit signature and shared information from registration.
Pages to view recent signees as well signatures only from specific city.

## To view:
Run source code on localhost:8080 one needs to launch server: `node index.js`.

Available on heroku: https://geoprivacy.herokuapp.com/
