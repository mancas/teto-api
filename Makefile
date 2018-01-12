VERSION=0.0.1

build:
	@docker build -t mancas/mancas:jose_rest_api_$(VERSION) .

start:
	@docker run --name jose_rest_api_container -p 3000:3000 --net joseweb -v /Users/manu/Documents/Images/jose:/opt/api/albums -v /Users/manu/Documents/Images/josealbums:/opt/api/public/images -d mancas/mancas:jose_rest_api_$(VERSION)

run: build
	@docker build -t mancas/mancas:jose_rest_api_$(VERSION) .
	@docker run --name jose_rest_api_container -p 3000:3000 --net joseweb -d mancas/mancas:jose_rest_api_$(VERSION)


deploy: build
	@docker network create joseweb
	@docker run --name mongojose -p 27017:27017 --net joseweb mongo
	@docker run --name jose_rest_api_container -p 3000:3000 --net joseweb -it jose_rest_api_$(VERSION)
