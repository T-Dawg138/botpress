import {
  Button,
  Icon,
  Intent,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  PopoverInteractionKind,
  Position,
  Tag,
  Tooltip
} from '@blueprintjs/core'
import { BotConfig } from 'botpress/sdk'
import { lang } from 'botpress/shared'
import React, { FC, Fragment } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import history from '~/history'
import { toastInfo } from '~/utils/toaster'

import AccessControl, { isChatUser } from '../../../App/AccessControl'

import { NeedsTrainingWarning } from './NeedsTrainingWarning'

interface Props {
  bot: BotConfig
  isApprover: boolean
  userEmail: string
  userStrategy: string
  hasError: boolean
  deleteBot?: () => void
  exportBot?: () => void
  createRevision?: () => void
  rollback?: () => void
  requestStageChange?: () => void
  approveStageChange?: () => void
  allowStageChange?: boolean
  reloadBot?: () => void
  viewLogs?: () => void
  nluModuleEnabled: boolean | undefined
}

const BotItemPipeline: FC<Props> = ({
  bot,
  isApprover,
  userEmail,
  userStrategy,
  hasError,
  requestStageChange,
  approveStageChange,
  deleteBot,
  exportBot,
  allowStageChange,
  createRevision,
  rollback,
  reloadBot,
  viewLogs,
  nluModuleEnabled
}) => {
  const botShortLink = `${window.location.origin + window['ROOT_PATH']}/s/${bot.id}`
  const botStudioLink = isChatUser() ? botShortLink : `studio/${bot.id}`
  const requiresApproval =
    isApprover &&
    bot.pipeline_status.stage_request &&
    !(bot.pipeline_status.stage_request.approvals || []).find(x => x.email === userEmail && x.strategy === userStrategy)

  return (
    <div className="pipeline_bot" key={bot.id}>
      <div className="actions">
        <AccessControl resource="admin.bots.*" operation="read">
          <Popover minimal position={Position.BOTTOM} interactionKind={PopoverInteractionKind.HOVER}>
            <Button id="btn-menu" icon={<Icon icon="menu" />} minimal />
            <Menu>
              {!bot.disabled && !hasError && (
                <Fragment>
                  <MenuItem icon="chat" text={lang.tr('admin.workspace.bots.item.openChat')} href={botShortLink} />
                  <MenuItem
                    disabled={bot.locked}
                    icon="edit"
                    text={lang.tr('admin.workspace.bots.item.editInStudio')}
                    href={botStudioLink}
                  />
                </Fragment>
              )}

              <CopyToClipboard
                text={botShortLink}
                onCopy={() => toastInfo(lang.tr('admin.workspace.bots.item.copyToClipboard'))}
              >
                <MenuItem icon="link" text={lang.tr('admin.workspace.bots.item.copyLinkToClipboard')} />
              </CopyToClipboard>
              <MenuDivider />

              <AccessControl resource="admin.logs" operation="read">
                <MenuItem
                  text={lang.tr('admin.workspace.bots.item.viewLogs')}
                  icon="manual"
                  id="btn-viewLogs"
                  onClick={viewLogs}
                />
              </AccessControl>

              {allowStageChange && (
                <MenuItem
                  text={lang.tr('admin.workspace.bots.item.promoteToNextStage')}
                  icon="double-chevron-right"
                  id="btn-promote"
                  onClick={requestStageChange}
                />
              )}

              <AccessControl resource="admin.bots.*" operation="write">
                <MenuItem
                  text={lang.tr('admin.workspace.bots.item.config')}
                  icon="cog"
                  id="btn-config"
                  onClick={() => history.push(`bots/${bot.id}`)}
                />
                <MenuItem
                  text={lang.tr('admin.workspace.bots.item.createRevision')}
                  icon="cloud-upload"
                  id="btn-createRevision"
                  onClick={createRevision}
                />
                <MenuItem
                  text={lang.tr('admin.workspace.bots.item.rollback')}
                  icon="undo"
                  id="btn-rollbackRevision"
                  onClick={rollback}
                />
                <MenuItem
                  text={lang.tr('admin.workspace.bots.item.export')}
                  icon="export"
                  id="btn-export"
                  onClick={exportBot}
                />
                <MenuItem
                  text={lang.tr('admin.workspace.bots.item.delete')}
                  icon="trash"
                  id="btn-delete"
                  onClick={deleteBot}
                />
                {hasError && (
                  <MenuItem text={lang.tr('admin.workspace.bots.item.reload')} icon="refresh" onClick={reloadBot} />
                )}
              </AccessControl>
            </Menu>
          </Popover>
        </AccessControl>
      </div>
      <div className="title">
        {bot.locked && (
          <span>
            <Icon icon="lock" intent={Intent.PRIMARY} iconSize={13} />
            &nbsp;
          </span>
        )}
        {bot.disabled ? (
          <span className="bot-name">{bot.name}</span>
        ) : (
          <a className="bot-name" href={botStudioLink}>
            {bot.name}
          </a>
        )}
        {requiresApproval && (
          <Tag intent={Intent.DANGER} className="botbadge reviewNeeded">
            {lang.tr('admin.workspace.bots.item.needsYourReview')}
          </Tag>
        )}
        {bot.pipeline_status.stage_request && isApprover && !requiresApproval && (
          <Tag intent={Intent.SUCCESS} className="botbadge reviewNeeded">
            {lang.tr('admin.workspace.bots.item.approved')}
          </Tag>
        )}

        {nluModuleEnabled && <NeedsTrainingWarning bot={bot.id} languages={bot.languages} />}

        {!bot.defaultLanguage && (
          <Tooltip position="right" content={lang.tr('admin.workspace.bots.item.languageIsMissing')}>
            <Icon icon="warning-sign" intent={Intent.DANGER} style={{ marginLeft: 10 }} />
          </Tooltip>
        )}
      </div>
      <p>{bot.description}</p>
      <div className="bottomRow">
        {bot.disabled && (
          <Tag intent={Intent.WARNING} className="botbadge">
            {lang.tr('admin.workspace.bots.item.disabled')}
          </Tag>
        )}
        {bot.private && (
          <Tag intent={Intent.PRIMARY} className="botbadge">
            {lang.tr('admin.workspace.bots.item.private')}
          </Tag>
        )}
        {hasError && (
          <Tag intent={Intent.DANGER} className="botbadge">
            {lang.tr('admin.workspace.bots.item.error')}
          </Tag>
        )}
        {bot.pipeline_status.stage_request && (
          <Tooltip
            content={
              <div>
                <p>
                  {lang.tr('admin.workspace.bots.item.requestedBy', {
                    requester: bot.pipeline_status.stage_request.requested_by
                  })}
                  <br />
                  {lang.tr('admin.workspace.bots.item.onDate', {
                    date: new Date(bot.pipeline_status.stage_request.requested_on).toLocaleDateString()
                  })}
                </p>
                {bot.pipeline_status.stage_request.message && <p>{bot.pipeline_status.stage_request.message}</p>}
              </div>
            }
          >
            <Tag className="botbadge" id="status-badge">
              {bot.pipeline_status.stage_request.status}
            </Tag>
          </Tooltip>
        )}
        {requiresApproval && (
          <div className="stage-approval-btns">
            <Button onClick={approveStageChange} small intent="success">
              {lang.tr('admin.workspace.bots.item.approve')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BotItemPipeline
