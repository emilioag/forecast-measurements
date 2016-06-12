from pymongo import MongoClient


class MongoCon(object):
    __db = None

    @classmethod
    def get_connection(cls):
        if cls.__db is None:
            client = MongoClient()
            cls.__db = client['forecast']
        return cls.__db
