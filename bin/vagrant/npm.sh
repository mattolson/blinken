#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
# update npm
echo "==> Switch to Vagrant";
cd /vagrant/app

echo "==> Updating NPM";
# sudo npm install npm -g
# sudo npm update

echo "==> Installing Modules";
sudo npm install