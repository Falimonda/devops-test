#!/bin/bash

temp=$1

sudo echo "$(date) - $0 starting now" >> $temp
while [[ true ]]; do
	p=$(pgrep node)
	if [[ ! $p == '' ]]; then
		echo "Do nothing"
	else
		sudo echo "$(date) - Something significant has happend. Acting now!" >> $temp
		$(bash /home/ec2-user/scripts/start.sh -b &) &
		sleep 3
	fi
	sleep 3
done
sudo echo "$(date) - $0 has stopped running" >> $temp
