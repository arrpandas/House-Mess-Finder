# TODO - Fix artifact publishing build failures

- [ ] Generate repo understanding of build scripts for artifacts/* and root
- [ ] Identify failing build cause (likely env var checks during Vite config evaluation)
- [ ] Update Vite configs to not require PORT/BASE_PATH during `vite build`
- [x] Update api-server to not crash during `node ./build.mjs` step (if needed)

- [ ] Run local build/typecheck (as far as pnpm availability allows) to validate no runtime env var access during build
- [ ] Re-attempt publishing/build in agent environment

