# Utilisation de l'image de base Node.js 22 sur Debian Bullseye
FROM node:20-bullseye

# Maintient du créateur ou de l'organisation
LABEL maintainer="Guilhem <guilhem.heinrich@gmail.com>"

# Définition de l'utilisateur par défaut à 'node'

# USER node

# Définition du répertoire de travail
WORKDIR /home/node/app

# Installation de Corepack (pour pnpm et yarn)
# Corepack est activé par défaut dans Node 16.10+, donc il suffit de l'activer
RUN corepack enable

# Mise à jour des paquets et installation des dépendances essentielles
# util-linux contient chsh pour changer le shell par défaut
# build-essential contient gcc, g++, make pour la compilation
# fish est installé comme shell alternatif
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    build-essential \
    fish \
    util-linux \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configuration de fish comme shell par défaut pour l'utilisateur root
RUN chsh -s /usr/bin/fish root
RUN chsh -s /usr/bin/fish node

# Installation de 'pnpm' ou 'yarn' via corepack
# L'utilisateur final peut choisir d'utiliser pnpm ou yarn
# RUN pnpm install
# RUN yarn install
USER node
# Définition de l'entrée du conteneur
# Utilisation de fish comme shell interactif par défaut
CMD ["fish"]