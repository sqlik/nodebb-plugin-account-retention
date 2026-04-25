<div class="acp-page-container">
	<div class="row">
		<div class="col-lg-9">
			<div class="acp-page-main-header align-items-center">
				<div>
					<h2 class="mb-0">[[account-retention:title]]</h2>
					<small class="text-muted">[[account-retention:subtitle]]</small>
				</div>
			</div>

			<ul class="nav nav-tabs mb-3" role="tablist">
				<li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tab-general">[[account-retention:tab.general]]</a></li>
				<li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-policy">[[account-retention:tab.policy]]</a></li>
				<li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-exemptions">[[account-retention:tab.exemptions]]</a></li>
				<li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-pending">[[account-retention:tab.pending]]</a></li>
				<li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-audit">[[account-retention:tab.audit]]</a></li>
			</ul>

			<form role="form" class="account-retention-settings">
				<div class="tab-content">

					<div class="tab-pane fade show active" id="tab-general">
						<div class="card mb-3">
							<div class="card-header">[[account-retention:section.general]]</div>
							<div class="card-body">
								<div class="alert alert-warning">[[account-retention:general.notice]]</div>
								<div class="mb-3 form-check form-switch">
									<input type="checkbox" class="form-check-input" id="enabled" name="enabled" />
									<label class="form-check-label" for="enabled">[[account-retention:field.enabled]]</label>
									<small class="form-text text-muted d-block">[[account-retention:field.enabled.help]]</small>
								</div>
								<div class="mb-3 form-check form-switch">
									<input type="checkbox" class="form-check-input" id="dryRun" name="dryRun" />
									<label class="form-check-label" for="dryRun">[[account-retention:field.dryRun]]</label>
									<small class="form-text text-muted d-block">[[account-retention:field.dryRun.help]]</small>
								</div>
								<div class="mb-3 form-check form-switch">
									<input type="checkbox" class="form-check-input" id="emailsEnabledInDryRun" name="emailsEnabledInDryRun" />
									<label class="form-check-label" for="emailsEnabledInDryRun">[[account-retention:field.emailsEnabledInDryRun]]</label>
									<small class="form-text text-muted d-block">[[account-retention:field.emailsEnabledInDryRun.help]]</small>
								</div>
								<div class="mb-3">
									<label class="form-label" for="cronHour">[[account-retention:field.cronHour]]</label>
									<input type="number" min="0" max="23" class="form-control" id="cronHour" name="cronHour" />
									<small class="form-text text-muted">[[account-retention:field.cronHour.help]]</small>
								</div>
							</div>
						</div>
					</div>

					<div class="tab-pane fade" id="tab-policy">
						<div class="card mb-3">
							<div class="card-header">[[account-retention:section.policy]]</div>
							<div class="card-body">
								<div class="mb-3">
									<label class="form-label" for="inactivityDays">[[account-retention:field.inactivityDays]]</label>
									<input type="number" min="30" class="form-control" id="inactivityDays" name="inactivityDays" />
									<small class="form-text text-muted">[[account-retention:field.inactivityDays.help]]</small>
								</div>
								<div class="mb-3">
									<label class="form-label" for="warningDays">[[account-retention:field.warningDays]]</label>
									<input type="text" class="form-control" id="warningDays" name="warningDays" placeholder="30,7" />
									<small class="form-text text-muted">[[account-retention:field.warningDays.help]]</small>
								</div>
								<div class="mb-3">
									<label class="form-label" for="keepaliveTokenTtlDays">[[account-retention:field.keepaliveTokenTtlDays]]</label>
									<input type="number" min="1" class="form-control" id="keepaliveTokenTtlDays" name="keepaliveTokenTtlDays" />
									<small class="form-text text-muted">[[account-retention:field.keepaliveTokenTtlDays.help]]</small>
								</div>
								<div class="mb-3">
									<label class="form-label" for="gracePeriodDaysAfterInstall">[[account-retention:field.gracePeriodDaysAfterInstall]]</label>
									<input type="number" min="0" class="form-control" id="gracePeriodDaysAfterInstall" name="gracePeriodDaysAfterInstall" />
									<small class="form-text text-muted">[[account-retention:field.gracePeriodDaysAfterInstall.help]]</small>
								</div>
								<div class="mb-3">
									<label class="form-label" for="auditRetentionDays">[[account-retention:field.auditRetentionDays]]</label>
									<input type="number" min="30" class="form-control" id="auditRetentionDays" name="auditRetentionDays" />
									<small class="form-text text-muted">[[account-retention:field.auditRetentionDays.help]]</small>
								</div>
							</div>
						</div>
					</div>

					<div class="tab-pane fade" id="tab-exemptions">
						<div class="card mb-3">
							<div class="card-header">[[account-retention:section.exemptions]]</div>
							<div class="card-body">
								<div class="mb-3">
									<label class="form-label" for="exemptGroups">[[account-retention:field.exemptGroups]]</label>
									<input type="text" class="form-control" id="exemptGroups" name="exemptGroups" placeholder="administrators,Global Moderators" />
									<small class="form-text text-muted">[[account-retention:field.exemptGroups.help]]</small>
								</div>
								<div class="mb-3">
									<label class="form-label" for="exemptUids">[[account-retention:field.exemptUids]]</label>
									<input type="text" class="form-control" id="exemptUids" name="exemptUids" placeholder="1,42,99" />
									<small class="form-text text-muted">[[account-retention:field.exemptUids.help]]</small>
								</div>
								<div class="mb-3 form-check form-switch">
									<input type="checkbox" class="form-check-input" id="includeBanned" name="includeBanned" />
									<label class="form-check-label" for="includeBanned">[[account-retention:field.includeBanned]]</label>
									<small class="form-text text-muted d-block">[[account-retention:field.includeBanned.help]]</small>
								</div>
								<div class="mb-3 form-check form-switch">
									<input type="checkbox" class="form-check-input" id="includeNeverLoggedIn" name="includeNeverLoggedIn" />
									<label class="form-check-label" for="includeNeverLoggedIn">[[account-retention:field.includeNeverLoggedIn]]</label>
									<small class="form-text text-muted d-block">[[account-retention:field.includeNeverLoggedIn.help]]</small>
								</div>
							</div>
						</div>
					</div>

					<div class="tab-pane fade" id="tab-pending">
						<div class="card mb-3">
							<div class="card-header d-flex justify-content-between align-items-center">
								<span>[[account-retention:section.pending]]</span>
								<div>
									<button type="button" id="preview-btn" class="btn btn-sm btn-outline-primary">[[account-retention:pending.preview]]</button>
									<button type="button" id="run-now-btn" class="btn btn-sm btn-danger ms-2">[[account-retention:pending.runNow]]</button>
								</div>
							</div>
							<div class="card-body">
								<div class="alert alert-info">[[account-retention:pending.notice]]</div>
								<div id="pending-summary" class="mb-3 small text-muted"></div>
								<div class="table-responsive">
									<table class="table table-sm table-striped" id="pending-table">
										<thead>
											<tr>
												<th>UID</th>
												<th>[[account-retention:col.username]]</th>
												<th>[[account-retention:col.daysInactive]]</th>
												<th>[[account-retention:col.action]]</th>
												<th>[[account-retention:col.daysUntilDelete]]</th>
											</tr>
										</thead>
										<tbody></tbody>
									</table>
								</div>
							</div>
						</div>
					</div>

					<div class="tab-pane fade" id="tab-audit">
						<div class="card mb-3">
							<div class="card-header d-flex justify-content-between align-items-center">
								<span>[[account-retention:section.audit]]</span>
								<button type="button" id="audit-refresh" class="btn btn-sm btn-outline-secondary">[[account-retention:audit.refresh]]</button>
							</div>
							<div class="card-body">
								<div id="audit-totals" class="mb-3 small text-muted"></div>
								<div class="table-responsive">
									<table class="table table-sm table-striped" id="audit-table">
										<thead>
											<tr>
												<th>[[account-retention:col.when]]</th>
												<th>UID</th>
												<th>[[account-retention:col.action]]</th>
												<th>[[account-retention:col.days]]</th>
												<th>[[account-retention:col.dryRun]]</th>
												<th>[[account-retention:col.error]]</th>
											</tr>
										</thead>
										<tbody></tbody>
									</table>
								</div>
							</div>
						</div>
					</div>

				</div>
			</form>
		</div>
		<div class="col-lg-3 acp-sidebar">
			<div class="card">
				<div class="card-header">[[account-retention:save.header]]</div>
				<div class="card-body">
					<button id="save" class="btn btn-primary w-100">[[account-retention:save.button]]</button>
					<small class="form-text text-muted d-block mt-2">[[account-retention:save.help]]</small>
				</div>
			</div>
		</div>
	</div>
</div>
