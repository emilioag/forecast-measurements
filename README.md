# Forecast Measurements

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
