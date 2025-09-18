{
  description = "Astro Mutable State Dev Shell";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {

          buildInputs = [
            pkgs.bun
            pkgs.dotenvx
          ];

          shellHook = ''
            echo "✨ Astro dev environment ready. Run 'bun install' then 'bunx --bun astro dev'"
          '';
        };
      }
    );
}

