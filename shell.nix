# https://github.com/DavHau/mach-nix/blob/master/examples.md
{ pkgs ? import <nixpkgs> {} }:
let
  mach-nix = import (
    builtins.fetchGit {
      url = "https://github.com/DavHau/mach-nix/";
      ref = "refs/tags/3.3.0";
    }
  ) {
    python = "python39";
  };
in

mach-nix.mkPythonShell {
  requirements = builtins.readFile ./requirements.txt;
}
