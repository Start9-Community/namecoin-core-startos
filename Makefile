PKG_ID := namecoind
PKG_VERSION := $(shell yq e ".version" manifest.yaml)
TS_FILES := $(shell find . -name \*.ts 2>/dev/null)
ASSETS := $(shell yq e '.assets.[].src' manifest.yaml 2>/dev/null)
ASSET_PATHS := $(addprefix assets/,$(ASSETS))
S9PK_PATH := $(shell find . -name $(PKG_ID).s9pk -print 2>/dev/null)

.DELETE_ON_ERROR:

all: verify

verify: $(PKG_ID).s9pk
	start-sdk verify s9pk $(S9PK_PATH)

clean:
	rm -f docker-images/*.tar
	rm -f $(PKG_ID).s9pk

# Build the s9pk package
$(PKG_ID).s9pk: manifest.yaml LICENSE instructions.md icon.png docker-images/aarch64.tar docker-images/x86_64.tar
	start-sdk pack

# Build Docker image for ARM64
docker-images/aarch64.tar: Dockerfile docker_entrypoint.sh check-rpc.sh properties.sh migrations.sh reindex.sh assets/compat/config_spec.yaml assets/compat/config_rules.yaml assets/compat/namecoin.conf.template
	mkdir -p docker-images
	DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build \
		--tag start9/$(PKG_ID)/main:$(PKG_VERSION) \
		--platform=linux/arm64 \
		-o type=docker,dest=docker-images/aarch64.tar .

# Build Docker image for x86_64
docker-images/x86_64.tar: Dockerfile docker_entrypoint.sh check-rpc.sh properties.sh migrations.sh reindex.sh assets/compat/config_spec.yaml assets/compat/config_rules.yaml assets/compat/namecoin.conf.template
	mkdir -p docker-images
	DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build \
		--tag start9/$(PKG_ID)/main:$(PKG_VERSION) \
		--platform=linux/amd64 \
		-o type=docker,dest=docker-images/x86_64.tar .

# Convenience targets for single-platform builds
x86: docker-images/x86_64.tar
arm: docker-images/aarch64.tar
