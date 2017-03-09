REST API SPECIFICATION
===

**Get available hours for selected date**
----
  _Called on select date, return the list of available hours for selected date._

* **URL**
  _/availableHours_

* **Method:**
  `GET`
  
*  **URL Params**

   * **Required:**
  `selectedDate=[string]`

* **Success Response:**
  _Returns an array with available hours for selected date, a SUCCESS level and a message. <br/> You can use level to return a 200 code response with an error and an optional message to explain what has happened._
  * **Code:** 200 <br />
    **Content:** 
```
{
	"availableHours": [
	  "10:00",
	  "10.30",
	  "11.30",
	  "12.30",
	  "13.00",
	  "17.00",
	  "17.30",
	  "18.00",
	  "18.30",
	  "19.00"
	],
	"level": "SUCCESS",
	"message": ""
}
```
	
* **Sample Call:**
```
curl --request GET \
  --url 'http://localhost:8080/api/availableHours?selectedDate=2017-03-22T00%3A00%3A00.000Z' \
  --header 'cache-control: no-cache' \
  --header 'content-type: application/json' \
  --header 'postman-token: d09f589d-d563-f893-c7c3-e814e4a7b2d4' \
  --data '{"selectedDate": "06/03/2016"}'
```


**Reserve hour for selected date**
----
  _Called on reserve action. Reserve selected hour from list of available hours for selected date passing user data._

* **URL**
  _/reserve_

* **Method:**
  `POST`
  
* **Data Params**
_Include selected date, selected data and user data._
```
{
	"selectedDate": "2017-03-25T00:00:00.000Z",
	"selectedHour": "10:00",
	"userData": {
		"name": "Héctor",
		"phone": "123456789",
		"email": "hector@email.com"
	}
}
```

* **Success Response:**
  _Returns  a SUCCESS level and a message. <br/> You can use level to return a 200 code response with an error and an optional message to explain what has happened._
  
  * **Code:** 200 <br />
    **Content:** 
```
{
  "level": "SUCCESS",
  "message": ""
}
```
	
* **Sample Call:**
```
	curl --request GET \
	curl --request POST \
	  --url http://localhost:8080/api/reserve \
	  --header 'cache-control: no-cache' \
	  --header 'content-type: application/json' \
	  --header 'postman-token: 5068a8dc-c266-df52-f532-343f6da88da3' \
	  --data '{"selectedDate": "2017-03-22T00:00:00.000Z", "selectedHour": "10:00", "userData": {"name": "Héctor", "phone": "676310552", "email": "hectormartosg"}}'
  
```