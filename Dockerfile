FROM node as build
COPY ./ /app	
WORKDIR /app	
RUN npm install
FROM node:alpine
COPY --from=build /app /	
EXPOSE 80

CMD ["index.js"]