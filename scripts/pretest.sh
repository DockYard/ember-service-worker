#!/bin/bash
NC='\e[0m'
C='\e[36m'

function notice {
  echo -e "\n\n${C}$1${NC}"
}

FIXTURE_PATH="./node-tests/fixtures"
SIMPLE_PATH="$FIXTURE_PATH/simple-app"
MU_PATH="$FIXTURE_PATH/mu-app"
PKG="ember-service-worker.tgz"
FIXTURE_PKG_PATH="./node-tests/fixtures/$PKG"

notice "Packing Addon..."
npm pack .

notice "Renaming and moving package..."
mv ember-service-worker-0.7.0.tgz $FIXTURE_PKG_PATH

notice "Copying package into dummy app directories..."
cp $FIXTURE_PKG_PATH "$SIMPLE_PATH/$PKG"
cp $FIXTURE_PKG_PATH "$MU_PATH/$PKG"

notice "Installing Dependencies for Simple App"
( cd $SIMPLE_PATH && npm install $PKG && npm install )

notice "Installing Dependencies for Module Unification App"
( cd $MU_PATH && npm install $PKG && npm install )

