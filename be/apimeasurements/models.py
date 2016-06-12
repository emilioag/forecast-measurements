import datetime
import csv
from common.mongodb import MongoCon
from common import filters


class Measurement:
    def __init__(self):
        self.db = MongoCon().get_connection()
        self.full = []
        self.fullIndexes = {}

    def sensor_ids(self):
        return self.db.measurements.distinct('id_sensor')

    def signal_ids(self):
        return self.db.measurements.distinct('id_signal')

    def data(self, start, end, sensor, signals, granularity):
        ag = [
            filters.matchRange(start, end, sensor, signals),
            filters.projectDates(),
            filters.groupByGranularity(granularity),
            {'$sort': {'_id.date': 1}},
            filters.projectAccumulateByGranularity(len(signals))
        ]
        if len(signals) == 1:
            ag += [filters.groupPushData()]
        elif len(signals) > 1:
            ag += [
                filters.groupByDateGetValuesPerSignal(signals),
                filters.projectGetListOfDatesAndRemoveNotNumberValues(signals),
                {'$sort': {'_id': 1}},
                filters.groupAllInOne(signals),
                filters.projectAxes(signals)
            ]
        else:
            raise Exception("Signals are mandatory")
        return [i for i in self.db.measurements.aggregate(ag)]

    def get_chart_data(self, signal_ids, start, end, sensor=None, g='daily'):
        if len(signal_ids) > 1:
            data = {'type': 'multiaxisline'}
        else:
            data = {'type': 'line'}
        dset = self.data(start, end, sensor, signal_ids, g)
        data.update({
            'dataset': {} if len(dset) == 0 else dset[0],
            'chart': {
                'caption': " ".join(signal_ids),
                'subcaption': "Last 1 week",
                'xAxisName': "Week of Year",
                'showValues': 0,
                'theme': "fint"
            }
        })
        return data

    def load_csv(self, csvfile):
        filename_as_list = csvfile.rstrip('.csv').split('-')
        sensor_id = filename_as_list[0]
        csv_str_date = filename_as_list[1]
        csv_date = datetime.datetime.strptime(csv_str_date, '%d%m%Y')
        with open(csvfile, 'r') as csvfile:
            for row in csv.DictReader(csvfile, delimiter=','):
                isoformat = datetime.datetime.fromtimestamp(
                    float(row['timestamp']))
                key = '%s.%s' % (row['timestamp'], row['id_signal'])
                if key not in self.fullIndexes:
                    self.fullIndexes[key] = len(self.full)
                    self.full.append({
                            '_id': {
                                'timestamp': row['timestamp'],
                                'id_signal': row['id_signal']
                            },
                            'id_signal': row['id_signal'],
                            'value': float(row['value']),
                            'date': isoformat,
                            'csv_date': csv_date,
                            'id_sensor': sensor_id
                        })
                else:
                    if csv_date > self.full[self.fullIndexes[key]]['csv_date']:
                        index = self.fullIndexes[key]
                        self.full[index]['value'] = float(row['value'])
                        self.full[index]['csv_date'] = csv_date

    def save_in_db(self):
        for row in self.full:
            try:
                self.db.measurements.update_one({
                    '$and': [
                        {'_id': row['_id']},
                        {'csv_date': {'$lt': row['csv_date']}}
                    ]},
                    {
                        '$set': {
                            'id_signal': row['id_signal'],
                            'value': row['value'],
                            'date': row['date'],
                            'csv_date': row['csv_date'],
                            'id_sensor': row['id_sensor']
                        }
                    },
                    upsert=True
                )
            except:
                print("NO ACTUALIZADO")
                pass
