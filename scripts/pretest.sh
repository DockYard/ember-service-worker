FIXTURE_PATH="./node-tests/fixtures"
SIMPLE_PATH="$FIXTURE_PATH/simple-app"
MU_PATH="$FIXTURE_PATH/mu-app"
PKG="ember-service-worker.tgz"
FIXTURE_PKG_PATH="./node-tests/fixtures/$PKG"

echo "Packing Addon..."
npm pack .

echo "Renaming and moving package..."
mv ember-service-worker-0.7.0.tgz $FIXTURE_PKG_PATH

echo "Copying package into dummy app directories..."
cp $FIXTURE_PKG_PATH "$SIMPLE_PATH/$PKG"
cp $FIXTURE_PKG_PATH "$MU_PATH/$PKG"

echo "Installing Dependencies for Simple App"
( cd $SIMPLE_PATH && npm install $PKG && npm install )

echo "Installing Dependencies for Module Unification App"
( cd $MU_PATH && npm install $PKG && npm install )

