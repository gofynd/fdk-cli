import React from 'react'
import styles from './page-not-found.less'
import { FDKLink } from 'fdk-core/components';


function PageNotFound({title}) {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.emptyState}>
        <img src="https://cdn.pixelbin.io/v2/falling-surf-7c8bb8/fyprod/wrkr/company/884/applications/000000000000000000000004/theme/pictures/free/original/empty-state.dad8145f254f744108af946933831880.png" alt="" />
        <div className={styles.noItems}>
          <p className={styles.title}>{ title}</p>
        </div>
        <FDKLink to={'/'} className={styles.btnLink}>
          <button className={styles.backBtn}>
            <span> Go to Home</span>
          </button>
        </FDKLink>
      </div>

    </div>
  )
}
PageNotFound.defaultProps = {
  title:"Page Not Found"
}

export default PageNotFound