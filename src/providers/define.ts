import { languages, Location, Position, Uri } from 'vscode';
import type { DefinitionProvider, ExtensionContext } from 'vscode';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import isEmpty from 'lodash/isEmpty';
import { FORMAT_MESSAGE_ID_REGEX } from 'utils/code';
import { thorwNewError } from 'utils/log';
import { getWrokspaceFloder, isSamePath } from 'utils/path';
import { SUPPORT_DOCUMENT_SELECTOR } from 'constants/index';
import { GlobalExtensionSubject } from 'utils/conf';
import { readJsonFile } from 'utils/fs';
import { I18nMetaJson, i18nDirItem, I18nType } from 'types/index';

const definitionProvider: DefinitionProvider = {
    async provideDefinition(document, position, token) {
        const line = document.lineAt(position);
        const lineText = line.text;
        const matchValue = lineText.match(FORMAT_MESSAGE_ID_REGEX)?.[1];

        if (matchValue) {
            const {
                i18nDirList,
                mainLanguage,
            } = await firstValueFrom(GlobalExtensionSubject);
            const currentWorkFolder = await getWrokspaceFloder({
                multiplySelect: 'matchFile',
                matchPath: document.uri,
            });
            const matchI18nDirList = i18nDirList.filter(i18nDir => isSamePath(i18nDir.projectPath, currentWorkFolder.uri.fsPath));

            if (isEmpty(matchI18nDirList)) {
                thorwNewError('全局配置匹配不到此工作区文件夹', RangeError);
            }

            const metaJsons = await Promise.all(matchI18nDirList
                .map((item =>
                    readJsonFile<I18nMetaJson>(item.targetPath)
                        .then((metaJson: I18nMetaJson) => ({ ...metaJson, ...item }))
                )));

            function getI18nList(metaJson: I18nMetaJson & i18nDirItem) {
                const i18nType = I18nType[mainLanguage];
                return metaJson
                    .saveContent[i18nType]
                    .map((item) => ({ ...item, keys: Object.keys(item.content) }))
                    ;
            };
            const i18nContents = metaJsons.flatMap(getI18nList);

            const matchI18nContent = i18nContents.find((item) => item.keys.some((key) => key === matchValue));

            if (!matchI18nContent) {
                return;
            }

            return new Location(Uri.file(matchI18nContent.path), new Position(0, 0))

        }
    },
};

export const createDefinitionProvider = (context: ExtensionContext) => {
    return languages.registerDefinitionProvider(SUPPORT_DOCUMENT_SELECTOR, definitionProvider);
};