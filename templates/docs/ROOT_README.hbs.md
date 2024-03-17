[comment]: # 'NOTE: This file is generated and should not be modify directly. Update `templates/ROOT_README.hbs.md` instead'

# Things Factory&trade; Micro-Module Edition

[![Build Status](https://travis-ci.org/hatiolab/dssp.svg?branch=master)](https://travis-ci.org/hatiolab/dssp)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

ThingsFactory&trade; is a software framework brand for the production of commercial-level web applications licensed by [Hatiolab](https://www.hatiolab.com).

ThingsFactory&trade; Micro-Module Edition implements an architecture that produces web applications by composing fine-grained micro modules.

These modules compose together to help you create performant modern JS apps that you love to develop and test. These packages are developed primarily to be used on top of the stack we like best for our JS apps; Typescript for the flavor, Koa for the server, LitElement for UI, Apollo for data fetching, and Jest for tests. That said, you can mix and match as you like.

# Things Factory&trade; Digital Safety Supervision Platform Modules

## Running

```
# install
$ yarn install

# build
$ yarn build

# prepare database
$ yarn workspace @dssp/app migration

# execute for dev
$ yarn workspace @dssp/app serve:dev
```

## Release

The dssp repo is managed as a monorepo that is composed of {{jsPackages.length}} npm packages.
Each package has its own `README.md` and documentation describing usage.

```
# publish packages that have changed since the last release
$ yarn release

# publish all packages
$ yarn release:force

# Don't forget to commit all changes before release
```

```
# generate new dssp module (ie. @hatiolab/minutes)
$ yarn generate module
  ? What should this module's name be? e.g. quotation > # type "minutes"

# generate new entity in a module (ie. "vms" entity in @hatiolab/minutes module)
# please use 'service' instead if you are using typegraphql way for new entity.
$ yarn generate entity
  ? What is target package's name? e.g. quotation, weekly-report > # type "minutes"
  ? What should this entitie's name be? e.g. company, company-ext > # type "vms"

# generate new service in a module (ie. "vms" service in @hatiolab/minutes module)
$ yarn generate service
  ? What is target package's name? e.g. quotation, weekly-report > # type "minutes"
  ? What should this entitie's name be? e.g. company, company-ext > # type "vms"

# generate new page in a module (ie. "vms-view" page in @hatiolab/minutes module)
$ yarn generate page
  ? What is target package's name? e.g. quotation, weekly-report > # type "minutes"
  ? What should this pages's name be? e.g. abc-viewer > # type "vms-view"
```

### Package Index

| Package | Version | Description |
| ------- | ------- | ----------- |
{{#each jsPackages}}
| [{{name}}](packages/{{name}}) | <a href="https://badge.fury.io/js/%40dssp%2F{{name}}"><img src="https://badge.fury.io/js/%40dssp%2F{{name}}.svg" width="200px" /></a> | {{{description}}} |
{{/each}}

## Want to contribute?

Check out our [Contributing Guide](./.github/CONTRIBUTING.md)

## Copyright

Copyright © [Hatiolab](https://www.hatiolab.com/) Inc. All rights reserved.
See [EULA](EULA.md) for details.

<a href="http://www.hatiolab.com/"><img src="https://www.hatiolab.com/assets/img/logo.png" alt="Hatiolab" width="200" /></a>
