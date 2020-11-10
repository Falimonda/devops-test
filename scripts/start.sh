#!/bin/bash

temp=$(mktemp -p /home/ec2-user/logs)
echo $temp
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -b) option1=1; shift ;;
        -r) option2=1 ;;
        *) echo $'Unknown parameter passed: $1\nParameters must be passed separately'; exit 1 ;;
    esac
    shift
done

if [[ $option2 == '1' ]]; then
	sudo echo "$(date) - Starting interesting script" >> $temp
	$(bash /home/ec2-user/scripts/interesting-script.sh $temp &) &
fi

if [[ $option1 == '1' ]]; then
	sudo echo "$(date) - Starting server in specific mode" >> $temp
	$(cd /home/ec2-user/wewatch/server/ && sudo PORT=${PORT} node main.js 2>&1 > /dev/null &) 2>&1 > /dev/null &
else
	sudo echo "$(date) - Starting server in another mode" >> $temp
	cd /home/ec2-user/wewatch/server/ && sudo PORT=${PORT} node main.js
fi



