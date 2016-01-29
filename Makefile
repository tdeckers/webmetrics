CONTAINER_NAME=webmetrics

run:
	docker run --name $(CONTAINER_NAME) -v /share/sf_git/webmetrics:/usr/share/nginx/html/webmetrics -p 8080:80 -d nginx

rm:
	docker kill $(CONTAINER_NAME)
	docker rm $(CONTAINER_NAME)

exec:
	docker exec -ti $(CONTAINER_NAME) bash
