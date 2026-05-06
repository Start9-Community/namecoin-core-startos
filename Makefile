PKG_ID := namecoind
PKG_VERSION := $(shell yq e ".version" manifest.yaml)
S9PK := $(PKG_ID).s9pk

ASSETS := \
	manifest.yaml \
	LICENSE \
	instructions.md \
	icon.png \
	assets/compat/config_spec.yaml \
	assets/compat/config_rules.yaml \
	assets/compat/namecoin.conf.template

SCRIPTS := \
	docker_entrypoint.sh \
	check-rpc.sh \
	properties.sh \
	migrations.sh \
	reindex.sh

.DELETE_ON_ERROR:
.PHONY: all verify clean x86 arm

# Default target: build the s9pk for the host arch chain.
all: $(S9PK)

verify: $(S9PK)
	start-sdk verify s9pk $(S9PK)

clean:
	rm -f docker-images/*.tar
	rm -f $(S9PK)

# Build the s9pk package. Both arch tarballs are required because
# manifest.yaml does not declare an architecture restriction; if you
# only want one arch, use the `x86` or `arm` convenience targets.
$(S9PK): $(ASSETS) $(SCRIPTS) docker-images/aarch64.tar docker-images/x86_64.tar
	start-sdk pack

# Build Docker image for ARM64
docker-images/aarch64.tar: Dockerfile $(SCRIPTS) $(ASSETS)
	mkdir -p docker-images
	DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build \
		--tag start9/$(PKG_ID)/main:$(PKG_VERSION) \
		--platform=linux/arm64 \
		-o type=docker,dest=docker-images/aarch64.tar .

# Build Docker image for x86_64
docker-images/x86_64.tar: Dockerfile $(SCRIPTS) $(ASSETS)
	mkdir -p docker-images
	DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build \
		--tag start9/$(PKG_ID)/main:$(PKG_VERSION) \
		--platform=linux/amd64 \
		-o type=docker,dest=docker-images/x86_64.tar .

# Convenience targets for single-platform image builds (no s9pk pack).
x86: docker-images/x86_64.tar
arm: docker-images/aarch64.tar
