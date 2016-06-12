from datetime import datetime, timedelta
from random import choice


def toTimestamp(date):
    return (date - datetime(1970, 1, 1)).total_seconds()


def fromTimestamp(timestamp):
    return datetime.utcfromtimestamp(timestamp)

iso_format = "%Y-%m-%dT%H:%M:%S.%fZ"
initial_date = datetime.strptime("2017-01-01T10:00:00.000Z", iso_format)
timestamp = toTimestamp(initial_date)
csv_text = "id_signal,timestamp,value\n"
ranges = {
    'humidity': range(0, 101),
    'temperature': range(-50, 50),
    'wind': range(0, 200),
    'visibility': range(0, 20),
    'presure': range(900, 1200),
    'rain': range(0, 200)
}

for i in range(365):
    for signal_id, signal_range in ranges.items():
        csv_text += "{id_signal},{timestamp},{value}\n".format(
            id_signal=signal_id,
            timestamp=timestamp,
            value=choice(signal_range))
    current_date = fromTimestamp(timestamp) + timedelta(days=1)
    timestamp = toTimestamp(current_date)

# print csv_text

with open('sensor2017-01052016.csv', 'w') as csvfile:
    csvfile.write(csv_text)
