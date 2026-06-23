import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParamMap } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonNav,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ContactusServicesModule } from '../../services';
import {
  IContactAddEventArgs,
  OptionalContactGroupIdAndBrief,
  OptionalContactRoleIdAndBrief,
  NewContactFormComponent,
} from '@sneat/extension-contactus-shared';
import {
  ContactGroupWithIdAndBrief,
  ContactIdAndDboWithSpaceRef,
  ContactRole,
  ContactToContactRelation,
  IContactRoleWithIdAndBrief,
  NewContactBaseDboAndSpaceRef,
} from '@sneat/extension-contactus-contract';
import { BehaviorSubject } from 'rxjs';
import { emptySpaceRef } from '@sneat/core';
import {
  SpaceBaseComponent,
  SpaceComponentBaseParams,
} from '@sneat/space-components';
import type { IAssetContext } from '@sneat/extension-assetus-contract';
import { SpaceServiceModule } from '@sneat/space-services';
import { ClassName } from '@sneat/ui';

@Component({
  imports: [
    FormsModule,
    SpaceServiceModule,
    ContactusServicesModule,
    IonNav,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    NewContactFormComponent,
  ],
  providers: [
    SpaceComponentBaseParams,
    { provide: ClassName, useValue: 'NewContactPageComponent' },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'sneat-new-contact-page',
  templateUrl: './new-contact-page.component.html',
})
export class NewContactPageComponent
  extends SpaceBaseComponent
  implements OnInit
{
  // @ViewChild('nameInput', { static: true }) nameInput?: IonInput;

  // TODO: relationship is not implemented yet
  protected $relation = signal<ContactToContactRelation | undefined>(undefined);

  public readonly $contact = signal<NewContactBaseDboAndSpaceRef>({
    space: emptySpaceRef,
    dbo: {
      type: 'person',
      gender: 'unknown', // Undefined would indicate "loading" and gender form would be disabled.
    },
  } as ContactIdAndDboWithSpaceRef);

  protected readonly $contactGroupID = signal<string>('');
  protected readonly $contactRoleID = signal<ContactRole | undefined>(
    undefined,
  );

  // Feeds the preselected group/role (from URL query params) into the contact
  // form so the wizard can skip the group/role steps the user already chose.
  // BehaviorSubject replays the latest value to the form when it subscribes.
  protected readonly selectGroupAndRole$ = new BehaviorSubject<
    IContactAddEventArgs | undefined
  >(undefined);
  protected readonly $assetID = signal<string>('');

  protected readonly $contactRole =
    signal<OptionalContactRoleIdAndBrief>(undefined);
  protected readonly $contactGroup =
    signal<OptionalContactGroupIdAndBrief>(undefined);

  protected readonly $parentContactID = signal<string>('');

  protected readonly $title = computed(() => {
    const contactRoleBrief = this.$contactRole()?.brief;
    return contactRoleBrief
      ? `${contactRoleBrief.emoji} New ${contactRoleBrief.title.toLowerCase()}`
      : 'New contact';
  });

  protected readonly $asset = signal<IAssetContext | undefined>(undefined);

  constructor() {
    super();
    this.defaultBackPage = 'contacts';
    this.$asset.set(window.history.state?.asset as IAssetContext);

    // The contact's space drives the create request's spaceID. $contact starts
    // with emptySpaceRef, so fill it once the route's space is loaded; otherwise
    // createContact fails backend validation ("missing required field spaceID").
    effect(() => {
      const space = this.$space();
      if (space?.id) {
        this.$contact.update((c) =>
          c.space?.id === space.id ? c : { ...c, space },
        );
      }
    });
  }

  // onContactTypeChanged(v: ContactRole): void {
  //
  // }

  override ngOnInit(): void {
    super.ngOnInit();
    this.route.queryParamMap
      .pipe(this.takeUntilDestroyed())
      .subscribe(this.onUrlParamsChanged);
  }

  private readonly onUrlParamsChanged = (params: ParamMap): void => {
    const relation = params.get('relation');
    if (relation) {
      this.$relation.set(relation as ContactToContactRelation);
    }
    const contactGroupID = params.get('group');
    if (contactGroupID && contactGroupID !== this.$contactGroupID()) {
      this.$contactGroupID.set(contactGroupID);
    }
    const contactRole = params.get('role');

    if (contactRole && !this.$contactRole()) {
      this.$contactRoleID.set(contactRole as ContactRole);
    }

    const space = this.space;
    if (!space) {
      throw new Error('Space is not defined');
    }

    const assetId = params.get('asset');
    if (assetId && assetId !== this.$assetID()) {
      this.$assetID.set(assetId);
    }
    const parentContactID = params.get('contact');
    if (parentContactID && this.$parentContactID() !== parentContactID) {
      this.$parentContactID.set(parentContactID);
    }

    // Preselect group/role in the form. The form's handler only reads `.id`
    // (it self-loads the brief by ID), so a minimal id-only object is enough;
    // the cast satisfies the brief-required event-args type. `event` is unused
    // by the handler but required by the type.
    if (contactGroupID || contactRole) {
      this.selectGroupAndRole$.next({
        event: new Event('preselect'),
        group: contactGroupID
          ? ({ id: contactGroupID } as ContactGroupWithIdAndBrief)
          : undefined,
        role: contactRole
          ? ({ id: contactRole } as IContactRoleWithIdAndBrief)
          : undefined,
      });
    }
  };

  protected onContactChanged(contact: NewContactBaseDboAndSpaceRef): void {
    // console.log('onContactChanged', contact);
    this.$contact.set(contact);
  }
}
