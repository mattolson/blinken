# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  # config.vm.synced_folder ".", "/var/www/project"

  config.ssh.forward_agent = true
  config.vm.network "forwarded_port", guest: 1337, host: 1337

  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 2
  end

  # config.vm.provision :shell, :path => "bin/vagrant/dependencies.sh"
  config.vm.provision :shell, :path => "bin/vagrant/nodejs.sh"
  config.vm.provision :shell, :path => "bin/vagrant/npm.sh"

  config.trigger.after :up do
    # run_remote "bash /vagrant/bin/vagrant/npm.sh"
    # run_remote "bash /vagrant/bin/vagrant/npm.sh"
  end

end