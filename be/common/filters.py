import datetime


def matchRange(start, end, sensor, signals):
    iso_template = "%Y-%m-%dT%H:%M:%S.%fZ"
    startAsStr = start.strftime("%Y-%m-%dT00:00:00.000Z")
    endAsStr = end.strftime("%Y-%m-%dT23:59:59.999Z")
    return {
        '$match': {
            'date': {
                '$gte': datetime.datetime.strptime(startAsStr, iso_template),
                '$lt': datetime.datetime.strptime(endAsStr, iso_template)
            },
            'id_sensor': sensor,
            'id_signal': {'$in': signals}
        }
    }


def projectDates():
    def intToStr(e):
        return {'$substr': [e, 0, -1]}

    def formater(e):
        return {
            '$cond': [
                {'$lte': [e, 9]},
                {'$concat': ['0', intToStr(e)]},
                intToStr(e)
            ]
        }
    return {
        '$project': {
            '_id': 1,
            'date': 1,
            'id_signal': 1,
            'value': 1,
            'day': formater({'$dayOfMonth': '$date'}),
            'month': formater({'$month': '$date'}),
            'week': formater({'$week': '$date'}),
            'year': formater({'$year': '$date'})
        }
    }


def groupByGranularity(granularity):
    granularity_filter = {
        'monthly': ['$year', '-', '$month'],
        'weekly': ['$year', '-', '$week'],
        'daily': ['$year', '-', '$month', '-', '$day']
    }
    return {
        '$group': {
            '_id': {
                'date': {
                    '$concat': granularity_filter.get(granularity, [])
                },
                'id_signal': '$id_signal'}, 'value': {'$push': '$value'}
            }
    }


def groupPushData():
    return {
        '$group': {'_id': '$id_signal', 'data': {'$push': '$data'}}
    }


def projectAccumulateByGranularity(num):
    """
        num -- Number of signals
    """
    if num > 1:
        _filter = {
            '$project': {
                '_id': 0,
                'date': '$_id.date',
                'id_signal': '$_id.id_signal',
                'value': {
                    '$cond': [
                        {
                            '$eq': ['$_id.id_signal', 'rain']
                        },
                        {'$sum': '$value'},
                        {'$avg': '$value'}
                    ]
                }
            }
        }
    else:
        _filter = {
            '$project': {
                'data': {
                    'label': '$_id.date',
                    'value': {
                        '$cond': [
                            {
                                '$eq': ['$_id.id_signal', 'rain']
                            },
                            {'$sum': '$value'},
                            {'$avg': '$value'}
                        ]
                    }
                },
                'id_signal': '$_id.id_signal'
            }
        }
    return _filter


def groupByDateGetValuesPerSignal(signal_ids):
    _filter = {'$group': {'_id': '$date'}}
    for signal_id in signal_ids:
        _filter['$group'][signal_id] = {
            '$push': {
                '$cond': [
                    {'$eq': ['$id_signal', signal_id]}, '$value', {}
                ]
            }
        }
    return _filter


def projectGetListOfDatesAndRemoveNotNumberValues(signal_ids):
    _filter = {'$project': {'f': {'$literal': 1}}}
    for signal_id in signal_ids:
        _filter['$project'][signal_id] = {'$avg': '$%s' % signal_id}
    return _filter


def groupAllInOne(signal_ids):
    _filter = {'$group': {'_id': '$f', 'date': {'$push': {'label': '$_id'}}}}
    for signal_id in signal_ids:
        _filter['$group'][signal_id] = {'$push': {'value': '$%s' % signal_id}}
    return _filter


def projectAxes(signal_ids):
    _filter = {
        '$project': {
            '_id': 0,
            'categories': [{'category': '$date'}],
            'axis': []
        }
    }
    for signal_id in signal_ids:
        _filter['$project']['axis'].append({
            'title': {'$literal': signal_id},
            'dataset': [{'data': '$%s' % signal_id}]
        })
    return _filter
