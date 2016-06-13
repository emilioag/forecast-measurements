# Forecast Measurements

## Description
 Can load data through csv file and plot it.
 The files should have the next format:
  - Header: id_signal, timestamp, value
  - id_signal: in [humidity, temperature, wind, visibility, presure, rain]
  - timestamp: timestamp
  - value: number (value of the measure)
 The monthly, weekly and daily values are calculated as the average of the values of this period but if the signal is 'rain' the values are calculated as the sum of the values for each day.

You can find an example of csv_file in be/data.


## Install with Nginx + uWSGI
### Clone repo

```shell
$ git clone https://github.com/emilioag/forecast-measurements
$ cd forecast-measurements
```

### Build docker file

```shell
$ docker build -t forecast_measurements .
```

### Run docker container
```shell
$ docker run -d -p 80:80 forecast_measurements .
```

You can test it in your localhost (http://localhost)

## Get source code and run it in development environment
If you want to install the development environment, you need to install some OS dependencies:
- MongoDB > 3.2.6
- Python
- Pip

### Clone repo

```shell
$ git clone https://github.com/emilioag/forecast-measurements
```

### Install fe dependencies
```shell
$ cd forecast-measurements/fe
$ npm install
```

### Install be dependencies
```shell
$ cd forecast-measurements/be
$ virtualenv venv-forecast
$ source venv-forecast/bin/activate
$ pip install -r requirements.txt
```

### Run fe server
```shell
$ cd forecast-measurements/fe
$ gulp
```

### Run be server
```shell
$ cd forecast-measurements/be
$ source venv-forecast/bin/activate
$ python forecast.py
```

You can test it in your localhost (http://localhost:8090)
