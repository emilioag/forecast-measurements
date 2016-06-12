import unittest
from models import Csvs
import os

sensor1_25052016 = """id_signal,timestamp,value
temperature,1464106771,23
temperature,1464106772,23
temperature,1464106773,24
temperature,1464106774,25
temperature,1464106775,26
temperature,1464106776,27
temperature,1464106777,28
temperature,1464106778,28
temperature,1464106779,28
temperature,1464106780,28
humidity,1464106772,80
humidity,1464106773,75
humidity,1464106774,60
humidity,1464106775,50
humidity,1464106776,50
humidity,1464106777,50
humidity,1464106778,65
humidity,1464106779,65
humidity,1464106780,75
temperature,1464179500,25
temperature,1464179501,26
temperature,1464179502,27
temperature,1464179503,28
temperature,1464179504,29
temperature,1464179505,30
temperature,1464179506,31
temperature,1464179507,32"""

sensor2_26052016 = """id_signal,timestamp,value
temperature,1464106772,23
temperature,1464106773,100
temperature,1464106774,25
temperature,1464106775,26
temperature,1464106776,27
temperature,1464106777,28
temperature,1464106778,28
temperature,1464106779,28
temperature,1464106780,28
humidity,1464106772,80
humidity,1464106773,75
humidity,1464106774,60
humidity,1464106775,50
humidity,1464106776,50
humidity,1464106777,50
humidity,1464106778,65
humidity,1464106779,65
humidity,1464106780,75
temperature,1464179500,25
temperature,1464179501,26
temperature,1464179502,27
temperature,1464179503,28
temperature,1464179504,29
temperature,1464179505,30
temperature,1464179506,31
temperature,1464179507,32
temperature,1464257422,45
temperature,1464257423,20"""


class TestStringMethods(unittest.TestCase):

    def setUp(self):
        with open('sensor1-25052016.csv', 'w') as csvfile:
            csvfile.write(sensor1_25052016)
        with open('sensor2-26052016.csv', 'w') as csvfile:
            csvfile.write(sensor2_26052016)

    def tearDown(self):
        os.remove('sensor1-25052016.csv')
        os.remove('sensor2-26052016.csv')

    def test_load_one_csv(self):
        groupOfCsv = Csvs(None)
        groupOfCsv.load("sensor1-25052016.csv")
        i0 = groupOfCsv.fullIndexes['1464106771.temperature']
        i1 = groupOfCsv.fullIndexes['1464106773.temperature']
        self.assertEquals(groupOfCsv.full[i0]['value'], 23)
        self.assertEquals(groupOfCsv.full[i1]['value'], 24)
        groupOfCsv.load("sensor2-26052016.csv")
        i0 = groupOfCsv.fullIndexes['1464106771.temperature']
        i1 = groupOfCsv.fullIndexes['1464106773.temperature']
        self.assertEquals(groupOfCsv.full[i0]['value'], 23)
        self.assertEquals(groupOfCsv.full[i1]['value'], 100)

if __name__ == '__main__':
    unittest.main()
