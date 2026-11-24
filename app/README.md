# SKANE (protótipo funcional)

App de diagnóstico OBD-II em React Native + Expo + TypeScript, feito a partir do protótipo do Canva.

## Rodar no celular (Expo Go)

```bash
npm install
npx expo start
```

Abra o app **Expo Go** no Android e leia o QR code. Todas as telas funcionam com dados simulados.

## Gerar APK

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

O perfil `preview` (em `eas.json`) gera um `.apk` instalável direto, sem Play Store.

## Estrutura

```
App.tsx                      navegação (abas + telas empilhadas)
src/theme.ts                 cores e faixas de nota (Ótimo/Regular/Atenção)
src/types.ts                 tipos do domínio
src/services/obd.ts          interface ObdService + MockObdService  ← trocar aqui pelo adaptador real
src/services/data.ts         carro, usuário, postos, dicionário de códigos (P0301 etc.)
src/services/diagnostics.ts  nota de saúde, conferência de abastecimento, texto do relatório
src/context/AppContext.tsx   estado global (conexão, códigos, tanque, abastecimentos, relatórios)
src/components/              UI base, adaptador em SVG, gráfico de linha, medidor do tanque
src/screens/                 Início, Conectar, Diagnóstico, Sistema, Códigos, Relatório,
                             Histórico, Postos, Combustível, Abastecimento, Perfil
```

## Próximo passo: adaptador de verdade

1. `npx expo install react-native-ble-plx` e adicionar o config plugin no `app.json`.
2. Criar `BleObdService implements ObdService` enviando comandos ELM327
   (`ATZ`, `ATSP0`, `03` para códigos, `01 05` temperatura, `01 2F` tanque).
3. Trocar `export const obd` em `src/services/obd.ts` e remover `mockObd.simulateRefuel` do `AppContext`.
4. A partir daqui o Expo Go não serve mais: use `eas build --profile development`.

Atenção: o adaptador precisa ser **BLE** (Bluetooth Low Energy). Os ELM327 baratos com Bluetooth clássico não funcionam no iPhone e exigem outra biblioteca no Android.
