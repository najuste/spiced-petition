# Petition for Geoprivacy Protection

Location of our devices is being tracked and we are not in control of it.
__Let's call for more transparency in geoprivacy!!!__

*To learn more or check the [GEOPRIVACY MANIFESTO](http://grantmckenzie.com/academics/GeoprivacyManifesto2017.pdf)*

## Technology

Petition platform built with `jQuery`, templated with `Handlebars.js` at the front, `Node.js` & `Express.js` for the back. 
For registration asked password is encrypted with `bcrypt`, and thus before storing hashed and salted.
When registered, user information with `csurf` is stored in cookies, which helps to recognise user and log him in automatically.

For getting and displaying user location 2 API's are used - `ipinfo.io` for getting location from IP and `Leaflet.js` for displaying it.

![alt text](https://github.com/najuste/spiced-petition/blob/master/gifs/petition_gettingLocation.gif "Showing user, that browser shares location without permision")

Data stored in `Postgres` DB, but also `Redis` a nosql DB is used for caching a list of signers. 

## App Pages

* Registration/login (_only if not logged in_).
* Invitation to sign the petition for 'Geoprivacy Protection'. Signature is being taken from `canvas` element.
* View/edit signature.
![alt text](https://github.com/najuste/spiced-petition/blob/master/gifs/petition_signing.gif "Signing petition and clearing")
* View/edit personal information.
![alt text](https://github.com/najuste/spiced-petition/blob/master/gifs/petition_editingData.gif "Editing data, auto update")
* View the last 30 recent signees with if given age and city. City is linked, so it is possible to navigate to signees only from that specific city.


## To view:

_should have node installed_
To install dependencies: `npm install`. To run page on localhost:8080 launch server from command line with `node index.js`.

Also deployed on heroku. https://geoprivacy.herokuapp.com/
