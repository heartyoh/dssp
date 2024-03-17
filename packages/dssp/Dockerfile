# Use an official ubuntu image
FROM hatiolab/operato-env:latest

# Set the working directory to /app
WORKDIR /app

# copy application & configuration files
COPY . .

# run node install command
RUN yarn install

# Make port 3000 available to the world outside this container
EXPOSE 3000

CMD [ "yarn", "run", "serve" ]