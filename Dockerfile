FROM debian
MAINTAINER Emilio Arevalillo Gonzalez "agonzalez.emilio@gmail.com"

# 
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
RUN echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.2 main" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list

RUN apt-get update
RUN apt-get install -y nginx-full
RUN apt-get install -y uwsgi-plugin-python3
RUN apt-get install -y uwsgi
RUN apt-get install -y python3-requests
RUN apt-get install -y build-essential
RUN apt-get install -y python3-dev
RUN apt-get install -y python3-pip
RUN apt-get install -y mongodb-org=3.2.6 mongodb-org-server=3.2.6 mongodb-org-shell=3.2.6 mongodb-org-mongos=3.2.6 mongodb-org-tools=3.2.6
RUN apt-get install -y python3-dateutil
RUN apt-get install -y curl
RUN apt-get install -y supervisor


RUN pip3 install virtualenv


RUN mkdir -p /var/www/forecast/be
RUN mkdir -p /var/www/forecast/fe/core
RUN mkdir -p /var/www/forecast/fe/lib
RUN mkdir -p /var/install


ADD be/apimeasurements /var/www/forecast/be/apimeasurements
ADD be/common /var/www/forecast/be/common
ADD be/forecast.py /var/www/forecast/be/forecast.py
ADD fe/index.html /var/www/forecast/fe/index.html
ADD fe/core /var/www/forecast/fe/core
ADD fe/lib /var/www/forecast/fe/lib



ADD nginx_forecast /var/www/forecast/nginx_forecast
ADD uwsgi_forecast.ini /var/www/forecast/uwsgi_forecast.ini


RUN echo "daemon off;" >> /etc/nginx/nginx.conf


RUN rm /etc/nginx/sites-enabled/default


RUN ln -s /var/www/forecast/nginx_forecast /etc/nginx/sites-enabled/
RUN ln -s /var/www/forecast/uwsgi_forecast.ini /etc/uwsgi/apps-enabled/


RUN mkdir /opt/venv
RUN virtualenv /opt/venv/forecast -p python3



RUN /opt/venv/forecast/bin/pip install bottle
RUN /opt/venv/forecast/bin/pip install pymongo

RUN mkdir -p /data/db
RUN mkdir -p /var/log/supervisor
ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN chown -R mongodb:mongodb /data


RUN chown -R www-data:www-data /opt/venv/forecast
RUN chown -R www-data:www-data /var/www/forecast
RUN chmod 755 /var/www
RUN chmod 755 /var/www/forecast



EXPOSE 80



RUN mkdir -p /data/db && chown -R mongodb:mongodb /data/db

CMD ln -s /proc/self/fd /dev/fd; /usr/bin/supervisord -n