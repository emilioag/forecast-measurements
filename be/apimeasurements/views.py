from bottle import request, response, FileUpload
import os
import json
import datetime
from apimeasurements.models import Measurement


response.content_type = 'application/json'
response.headers['Access-Control-Allow-Origin'] = '*'
response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
response.headers['Access-Control-Allow-Headers'] =\
    'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'


def uploadFile():
    m = Measurement()
    for name, file in request.POST.allitems():
        if name == 'uploadfile' and isinstance(file, FileUpload):
            file.save(file.filename)
            try:
                m.load_csv(file.filename)
            finally:
                os.remove(file.filename)
    m.save_in_db()
    response.status = 201
    return response


def getChartData():
    m = Measurement()
    iso = "%Y-%m-%dT%H:%M:%S.%fZ"
    response.status = 200
    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')
    signal_ids = request.GET.getlist('signal_id')
    granul = request.GET.get('granularity', None)
    sensor = request.GET.get('sensor', None)
    end_date = request.GET.get('end_date', '')
    return json.dumps(
        m.get_chart_data(
            signal_ids,
            datetime.datetime.strptime(start_date, iso),
            datetime.datetime.strptime(end_date, iso),
            sensor,
            granul
        )
    )


def allSensorIds():
    m = Measurement()
    sensor_ids = m.sensor_ids()
    response.status = 200
    return json.dumps({'sensors': sensor_ids})


def allSignalIds():
    m = Measurement()
    signal_ids = m.signal_ids()
    response.status = 200
    signals = {}
    for signal_id in signal_ids:
        signals[signal_id] = {
            'checked': False,
            'visibility': False
        }
    return json.dumps(signals)
