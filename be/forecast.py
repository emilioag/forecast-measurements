#!/usr/bin/env python
import bottle
from apimeasurements.views import (
    uploadFile, allSensorIds, allSignalIds, getChartData)


def setup_routing(app):
    app.route('/api/chart', ['GET'], getChartData)
    app.route('/api/sensors', ['GET'], allSensorIds)
    app.route('/api/signals', ['GET'], allSignalIds)
    app.route('/api/uploadCSV', ['POST'], uploadFile)

if __name__ == "__main__":
    app = bottle.Bottle()
    setup_routing(app)
    app.run(host='0.0.0.0', port=8081)
else:
    application = bottle.default_app()
    setup_routing(application)
