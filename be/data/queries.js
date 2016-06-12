db.signals.aggregate([
    {
        '$match': {
            'date': {'$gte': ISODate('2016-05-28'), '$lt': ISODate('2016-06-28')},
             'id_sensor': 'sensor2016', 'id_signal': {'$in': ['visibility']}
        }
    },
    {
        '$project': {
            '_id': 1,
            'id_signal': 1,
            'value': 1,
            'date': 1,
            'day': {'$cond': [{ '$lte': [{'$dayOfMonth': '$date'}, 9 ] }, {'$concat': ['0', {'$substr': [{'$dayOfMonth': '$date'}, 0, -1 ]}]}, {'$substr': [{'$dayOfMonth': '$date'}, 0, 2 ]}]},
            'month': {'$cond': [{ '$lte': [{'$month': '$date'}, 9 ] }, {'$concat': ['0', {'$substr': [{'$month': '$date'}, 0, -1 ]}]}, {'$substr': [{'$month': '$date'}, 0, 2 ]}]},
            'week': { "$substr": [ {'$week': '$date'}, 0, -1  ] },
            'year': { "$substr": [ {'$year': '$date'}, 0, -1  ] }
        }
    },
    {
        '$group': {'_id': {'date': {'$concat': ['$year', '-', '$month', '-', '$day']}, 'id_signal': '$id_signal'}, 'value': {'$push': '$value'}}
    },
    {'$sort': {'_id.date': 1}},
    {
        '$project': {
            'data': {
                'label': '$_id.date',
                'value': {'$avg': '$value'}
            },
            'id_signal': '$_id.id_signal'
        }
    },
    {
        '$group': {'_id': '$id_signal', 'data': {'$push': '$data'}}
    }
])


db.signals.aggregate([
    {
        '$match': {
            'date': {'$gte': ISODate('2016-05-28'), '$lt': ISODate('2016-06-28')},
             'id_sensor': 'sensor2016', 'id_signal': {'$in': ['visibility', 'temperature']}
        }
    },
    {
        '$project': {
            '_id': 1,
            'id_signal': 1,
            'value': 1,
            'date': 1,
            'day': {'$cond': [{ '$lte': [{'$dayOfMonth': '$date'}, 9 ] }, {'$concat': ['0', {'$substr': [{'$dayOfMonth': '$date'}, 0, -1 ]}]}, {'$substr': [{'$dayOfMonth': '$date'}, 0, 2 ]}]},
            'month': {'$cond': [{ '$lte': [{'$month': '$date'}, 9 ] }, {'$concat': ['0', {'$substr': [{'$month': '$date'}, 0, -1 ]}]}, {'$substr': [{'$month': '$date'}, 0, 2 ]}]},
            'week': { "$substr": [ {'$week': '$date'}, 0, -1  ] },
            'year': { "$substr": [ {'$year': '$date'}, 0, -1  ] }
        }
    },
    {
        '$group': {'_id': {'date': {'$concat': ['$year', '-', '$month', '-', '$day']}, 'id_signal': '$id_signal'}, 'value': {'$push': '$value'}}
    },
    {
        '$project': {'_id': 0, 'date': '$_id.date', 'id_signal': '$_id.id_signal', 'value': {'$avg': '$value'}}
    },
    {
        '$group': {
            '_id': '$date',
            'temperature': {'$push': {'$cond': [{'$eq': ['$id_signal', 'temperature']}, '$value', null]}},
            'visibility': {'$push': {'$cond': [{'$eq': ['$id_signal', 'visibility']}, '$value', null]}}
        }
    },
    {
        '$project': {
            'temperature': {'$avg': '$temperature'},
            'visibility': {'$avg': '$visibility'},
            'fake': {'$literal': 1}
        }
    },
    {'$sort': {'_id': 1}},
    {
        '$group':{
            '_id': '$fake',
            'date': {'$push': {'label': '$_id'}},
            'temperature': {'$push': {'value': '$temperature'}},
            'visibility': {'$push': {'value': '$visibility'}},
        }
    },
    {
        '$project': {
            '_id': 0,
            'categories': [{'category': '$date'}],
            'axis': [
                {'title': {'$literal': 'temperature'}, 'dataset': [{'data': '$temperature'}]},
                {'title': {'$literal': 'visibility'}, 'dataset': [{'data': '$visibility'}]}
            ]
        }
    }
])






