# FROM --platform=linux/amd64 node:14.17.6
FROM node:14.17.6
# FROM mcr.microsoft.com/playwright:focal
FROM mcr.microsoft.com/playwright:v1.6.2-focal
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
COPY tsconfig.json /app
COPY . /app
# RUN rm -rf node_modules/ && yarn
RUN apt-get update &&\
apt-get -y install gstreamer1.0-libav &&\ 
# apt-get -y install libappindicator-gtk3 &&\
# apt-get -y install liberation-fonts &&\
apt-get -y install libnss3 &&\
apt-get -y install libasound2 &&\
apt-get -y install libatspi2.0-0 &&\
apt-get -y install libdrm2 &&\
apt-get -y install libgbm1 && \
apt-get -y install libgtk-3-0 && \
apt-get -y install libxkbcommon-x11-0 
RUN rm -rf node_modules/ && yarn
RUN npx playwright install-deps
# RUN cd playwright-master && \
#     yarn
# RUN apt-get update &&\ 
# apt-get -y install libnss3 libatk-bridge2.0-0 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libatspi2.0-0 libxshmfence-dev
# RUN apk add --no-cache libc6-compat  &&  ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2
EXPOSE 81
CMD ["yarn","start"]