{
  inputs.nix-npm-buildpackage.url = "github:serokell/nix-npm-buildpackage";
  inputs.nix-npm-buildpackage.inputs.nixpkgs.follows = "nixpkgs";
  outputs = { self, nixpkgs, nix-npm-buildpackage }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = with nixpkgs.legacyPackages.x86_64-linux; [
        yarn
        nodePackages.typescript-language-server
      ];
    };
    packages.x86_64-linux.default = nix-npm-buildpackage.legacyPackages.x86_64-linux.buildYarnPackage {
      src = ./.;
      postBuild = ''
        yarn install --production --ignore-scripts --prefer-offline
      '';
      postInstall = "rm $out/bin/yarn";
      meta.mainProgram = "marvin-timesync";
    };
  };
}
