#!/bin/bash

if [[ ! $1 == '' ]]; then
	client=$1
	aws s3 ls --recursive s3://videos.wewatch.com/$client/ > allFiles.txt
	cat allFiles.txt | awk '{print $4}' | cut -d '/' -f 1-2 | sort | uniq | grep '.*/.*/' | grep -v ".*\..*" | grep -v 'thumbnail' | grep -v '.*\/$'  > filteredItems.txt
	for vid in $(cat filteredItems.txt); do
		grep -q $vid/video.mp4 allFiles.txt
		if [[ $? == 0 ]]; then
			echo ${vid}
		fi
	done
else
	echo "Usage: get-client-videos.sh {client-name}"
fi
