# Generate the powerbox request:
./gen-pb-req.sh

# Symlink /node to the correct location on the dev machine:
[ -e node ] || ln -s $(which node)
